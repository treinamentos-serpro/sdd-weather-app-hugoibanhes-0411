import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchCities,
  getWeather,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Seattle');
    });

    it('codifica o nome completo e envia parâmetros de busca em pt-BR', async () => {
      const fetchSpy = mockFetchOnce({ results: [] });
      vi.stubGlobal('fetch', fetchSpy);

      await searchCities("São-João d'Ávila");

      const requestUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));
      expect(requestUrl.searchParams.get('name')).toBe("São-João d'Ávila");
      expect(requestUrl.searchParams.get('count')).toBe('5');
      expect(requestUrl.searchParams.get('language')).toBe('pt');
      expect(requestUrl.searchParams.get('format')).toBe('json');
      expect(requestUrl.search).toContain('%C3%A3');
    });

    it('normaliza país e região ausentes como null', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [{ id: 2, name: 'Springfield', latitude: 39.8, longitude: -89.6 }],
        }),
      );

      const result = await searchCities('Springfield');

      expect(result[0]).toMatchObject({ country: null, admin1: null });
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro tipado em falha de transporte', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network failure')));

      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro tipado quando o JSON de geocoding é inválido', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => {
            throw new SyntaxError('invalid json');
          },
        } as unknown as Response),
      );

      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('aborta geocoding sem resposta após 10 segundos', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
        ),
      );

      const request = searchCities('Seattle');
      const rejection = expect(request).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: expect.stringContaining('demorou demais'),
      });
      await vi.advanceTimersByTimeAsync(10_000);
      await rejection;
    });
  });

  describe('getWeather', () => {
    const response = {
      timezone: 'Europe/Lisbon',
      current: {
        time: '2026-06-16T12:00',
        temperature_2m: 20,
        relative_humidity_2m: 70,
        wind_speed_10m: 8,
        surface_pressure: 1014,
        precipitation: 0,
        weather_code: 1,
      },
      daily: {
        time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
        weather_code: [1, 2, 3, 61, 0],
        temperature_2m_max: [24, 23, 22, 19, 20],
        temperature_2m_min: [16, 15, 14, 12, 13],
        precipitation_sum: [0, 0.2, 1, 4, 0],
        wind_speed_10m_max: [12, 14, 10, 20, 8],
      },
    };

    it('constrói parâmetros Open-Meteo e mapeia o modelo normalizado', async () => {
      const fetchSpy = mockFetchOnce(response);
      vi.stubGlobal('fetch', fetchSpy);

      const data = await getWeather(CITY);
      const requestUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));

      expect(requestUrl.searchParams.get('timezone')).toBe('auto');
      expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
      expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
      expect(requestUrl.searchParams.get('wind_speed_unit')).toBe('kmh');
      expect(requestUrl.searchParams.get('precipitation_unit')).toBe('mm');
      expect(data.timezone).toBe('Europe/Lisbon');
      expect(data.current).toMatchObject({
        status: 'success',
        data: { temperatureC: 20, humidityPercent: 70, precipitationMm: 0 },
      });
      expect(data.forecast.status).toBe('success');
      expect(data.forecast.data).toHaveLength(5);
      expect(data.forecast.data?.[0]).toMatchObject({
        date: '2026-06-16',
        minTemperatureC: 16,
        maxTemperatureC: 24,
        precipitationMm: 0,
        windSpeedMaxKmh: 12,
        available: true,
      });
    });

    it('mantém current válido e marca forecast como erro quando daily está ausente', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ ...response, daily: null }));

      const data = await getWeather(CITY);

      expect(data.current.status).toBe('success');
      expect(data.forecast.status).toBe('error');
      expect(data.forecast.data).toBeNull();
    });

    it('mantém forecast válido e marca current como erro quando current está ausente', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ ...response, current: null }));

      const data = await getWeather(CITY);

      expect(data.current.status).toBe('error');
      expect(data.current.data).toBeNull();
      expect(data.forecast.status).toBe('success');
      expect(data.forecast.data).toHaveLength(5);
    });

    it('marca forecast como erro quando as séries diárias têm comprimentos incompatíveis', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          ...response,
          daily: { ...response.daily, temperature_2m_max: [24] },
        }),
      );

      const data = await getWeather(CITY);

      expect(data.current.status).toBe('success');
      expect(data.forecast.status).toBe('error');
    });

    it('preserva null e zero em métricas atuais e diárias', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          timezone: 'Europe/Lisbon',
          current: { precipitation: 0 },
          daily: {
            time: response.daily.time,
            weather_code: [null, null, null, null, null],
            temperature_2m_min: [0, null, null, null, null],
            temperature_2m_max: [0, null, null, null, null],
            precipitation_sum: [0, null, null, null, null],
            wind_speed_10m_max: [0, null, null, null, null],
          },
        }),
      );

      const data = await getWeather(CITY);

      expect(data.current).toMatchObject({
        status: 'success',
        data: {
          temperatureC: null,
          weatherCode: null,
          humidityPercent: null,
          windSpeedKmh: null,
          pressureHpa: null,
          precipitationMm: 0,
        },
      });
      expect(data.forecast.data?.[0]).toMatchObject({
        available: true,
        minTemperatureC: 0,
        maxTemperatureC: 0,
        precipitationMm: 0,
        windSpeedMaxKmh: 0,
      });
      expect(data.forecast.data?.[1]).toMatchObject({ available: false, minTemperatureC: null });
    });

    it('marca a previsão como erro quando há número diferente de cinco datas', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          ...response,
          daily: { ...response.daily, time: response.daily.time.slice(0, 4) },
        }),
      );

      const data = await getWeather(CITY);

      expect(data.current.status).toBe('success');
      expect(data.forecast.status).toBe('error');
    });

    it('lança erro tipado em HTTP, falha de rede e JSON inválido', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);

      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network failure')));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => {
            throw new SyntaxError('invalid json');
          },
        } as unknown as Response),
      );
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('solicita somente a seção indicada para retry', async () => {
      const fetchSpy = mockFetchOnce({ timezone: 'Europe/Lisbon', daily: response.daily });
      vi.stubGlobal('fetch', fetchSpy);

      const data = await getWeather(CITY, 'forecast');
      const requestUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));

      expect(requestUrl.searchParams.has('current')).toBe(false);
      expect(requestUrl.searchParams.has('daily')).toBe(true);
      expect(data.current.status).toBe('idle');
      expect(data.forecast.status).toBe('success');
    });

    it('solicita somente current quando a seção atual é repetida', async () => {
      const fetchSpy = mockFetchOnce({ timezone: 'Europe/Lisbon', current: response.current });
      vi.stubGlobal('fetch', fetchSpy);

      const data = await getWeather(CITY, 'current');
      const requestUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));

      expect(requestUrl.searchParams.has('current')).toBe(true);
      expect(requestUrl.searchParams.has('daily')).toBe(false);
      expect(data.current.status).toBe('success');
      expect(data.forecast.status).toBe('idle');
    });
  });
});
