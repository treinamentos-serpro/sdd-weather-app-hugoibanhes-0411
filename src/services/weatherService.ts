import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherSection,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

/** Erro tipado da camada de dados, com mensagem amigável ao usuário. */
export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

/** Faz um fetch com timeout via AbortController. */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais. Tente novamente.');
    }
    throw new WeatherServiceError('Falha de rede. Verifique sua conexão.');
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('A fonte retornou uma resposta inválida. Tente novamente.');
  }
}

/**
 * Busca cidades por nome (geocoding). Retorna lista vazia quando não há
 * resultados — o estado "vazio" é tratado pela camada de UI.
 */
export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new WeatherServiceError('Não foi possível buscar a cidade. Tente novamente.');
  }

  const data = asRecord(await readJson<unknown>(res));
  if (!data) {
    throw new WeatherServiceError('Resposta de geocoding inválida. Tente novamente.');
  }
  if (data.results == null) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError('Lista de cidades inválida. Tente novamente.');
  }

  return data.results.map((value): City => {
    const result = asRecord(value);
    if (
      !result ||
      typeof result.id !== 'number' ||
      typeof result.name !== 'string' ||
      typeof result.latitude !== 'number' ||
      typeof result.longitude !== 'number'
    ) {
      throw new WeatherServiceError('Resultado de cidade inválido. Tente novamente.');
    }

    return {
      id: result.id,
      name: result.name,
      country: typeof result.country === 'string' ? result.country : null,
      admin1: typeof result.admin1 === 'string' ? result.admin1 : null,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  });
}

type WeatherScope = 'all' | 'current' | 'forecast';
type JsonRecord = Record<string, unknown>;

interface NormalizedForecastResponse {
  timezone?: unknown;
  current?: unknown;
  daily?: unknown;
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function nullableNumber(record: JsonRecord, field: string): number | null {
  const value = record[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function successSection<T>(data: T): WeatherSection<T> {
  return { status: 'success', data, error: null };
}

function idleSection<T>(): WeatherSection<T> {
  return { status: 'idle', data: null, error: null };
}

function failedSection<T>(message: string): WeatherSection<T> {
  return { status: 'error', data: null, error: message };
}

function mapNormalizedCurrent(value: unknown): CurrentWeather {
  const current = asRecord(value);
  if (!current) {
    throw new WeatherServiceError('Bloco de clima atual inválido. Tente novamente.');
  }

  return {
    time: typeof current.time === 'string' ? current.time : null,
    temperatureC: nullableNumber(current, 'temperature_2m'),
    weatherCode: nullableNumber(current, 'weather_code'),
    humidityPercent: nullableNumber(current, 'relative_humidity_2m'),
    windSpeedKmh: nullableNumber(current, 'wind_speed_10m'),
    pressureHpa: nullableNumber(current, 'surface_pressure'),
    precipitationMm: nullableNumber(current, 'precipitation'),
  };
}

function mapNormalizedForecast(value: unknown): ForecastDay[] {
  const daily = asRecord(value);
  if (!daily || !Array.isArray(daily.time) || daily.time.length !== 5) {
    throw new WeatherServiceError('Resposta de previsão deve conter cinco datas locais.');
  }
  if (daily.time.some((date) => typeof date !== 'string')) {
    throw new WeatherServiceError('Resposta de previsão contém uma data inválida.');
  }

  const dates = daily.time as string[];
  const fields = [
    'weather_code',
    'temperature_2m_min',
    'temperature_2m_max',
    'precipitation_sum',
    'wind_speed_10m_max',
  ];
  const series = new Map<string, unknown[]>();

  for (const field of fields) {
    const valueForField = daily[field];
    if (valueForField == null) {
      series.set(field, Array<null>(dates.length).fill(null));
      continue;
    }
    if (!Array.isArray(valueForField) || valueForField.length !== dates.length) {
      throw new WeatherServiceError(`Série diária inválida: ${field}.`);
    }
    series.set(field, valueForField);
  }

  return dates.map((date, index) => {
    const metric = (field: string) => {
      const value = series.get(field)?.[index];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    };
    const weatherCode = metric('weather_code');
    const minTemperatureC = metric('temperature_2m_min');
    const maxTemperatureC = metric('temperature_2m_max');
    const precipitationMm = metric('precipitation_sum');
    const windSpeedMaxKmh = metric('wind_speed_10m_max');

    return {
      date,
      available: [
        weatherCode,
        minTemperatureC,
        maxTemperatureC,
        precipitationMm,
        windSpeedMaxKmh,
      ].some((value) => value !== null),
      weatherCode,
      minTemperatureC,
      maxTemperatureC,
      precipitationMm,
      windSpeedMaxKmh,
    };
  });
}

/**
 * Busca seções meteorológicas normalizadas. A consulta combinada é o padrão;
 * `scope` permite repetir apenas a seção que falhou.
 */
export async function getWeather(
  city: City,
  scope: WeatherScope = 'all',
): Promise<WeatherData> {
  const includesCurrent = scope !== 'forecast';
  const includesForecast = scope !== 'current';
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  if (includesCurrent) {
    params.set(
      'current',
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    );
  }
  if (includesForecast) {
    params.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    );
    params.set('forecast_days', '5');
  }

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima. Tente novamente.');
  }

  const payload = await readJson<NormalizedForecastResponse>(response);
  const responseRecord = asRecord(payload);
  if (!responseRecord || typeof responseRecord.timezone !== 'string') {
    throw new WeatherServiceError('Resposta meteorológica inválida. Tente novamente.');
  }

  let current: WeatherSection<CurrentWeather> = idleSection();
  if (includesCurrent) {
    try {
      current = successSection(mapNormalizedCurrent(responseRecord.current));
    } catch (error) {
      current = failedSection(
        error instanceof WeatherServiceError
          ? error.message
          : 'Resposta de clima atual inválida. Tente novamente.',
      );
    }
  }

  let forecast: WeatherSection<ForecastDay[]> = idleSection();
  if (includesForecast) {
    try {
      forecast = successSection(mapNormalizedForecast(responseRecord.daily));
    } catch (error) {
      forecast = failedSection(
        error instanceof WeatherServiceError
          ? error.message
          : 'Resposta de previsão inválida. Tente novamente.',
      );
    }
  }

  return { city, timezone: responseRecord.timezone, current, forecast };
}
