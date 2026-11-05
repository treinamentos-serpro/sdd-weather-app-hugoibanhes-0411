/**
 * Contratos de domínio compartilhados do Weather App.
 *
 * Decisão de arquitetura: as temperaturas são sempre armazenadas em Celsius
 * internamente e convertidas apenas na camada de apresentação. Assim, a troca
 * de unidade (C/F) nunca dispara um novo request.
 */

export type Unit = 'celsius' | 'fahrenheit';

/** Resultado da API de geocoding (uma cidade). */
export interface City {
  id: number;
  name: string;
  country: string | null;
  /** Estado/região, quando disponível (ajuda a desambiguar homônimos). */
  admin1: string | null;
  latitude: number;
  longitude: number;
}

/** Condições atuais normalizadas. Temperatura sempre em °C. */
export interface CurrentWeather {
  /** Horário local da observação, ou null quando indisponível. */
  time: string | null;
  /** Temperatura atual em graus Celsius. */
  temperatureC: number | null;
  /** Código WMO da condição atual. */
  weatherCode: number | null;
  /** Umidade relativa em porcentagem. */
  humidityPercent: number | null;
  /** Velocidade atual do vento em km/h. */
  windSpeedKmh: number | null;
  /** Pressão de superfície em hPa. */
  pressureHpa: number | null;
  /** Precipitação atual em mm. */
  precipitationMm: number | null;
}

/** Um dia local da previsão. Temperaturas sempre em °C. */
export interface ForecastDay {
  /** Data local no formato ISO YYYY-MM-DD. */
  date: string;
  /** Indica se há ao menos uma métrica meteorológica disponível. */
  available: boolean;
  /** Código WMO da condição diária, ou null se ausente. */
  weatherCode: number | null;
  /** Temperatura mínima em graus Celsius, ou null se ausente. */
  minTemperatureC: number | null;
  /** Temperatura máxima em graus Celsius, ou null se ausente. */
  maxTemperatureC: number | null;
  /** Volume total de precipitação em mm, ou null se ausente. */
  precipitationMm: number | null;
  /** Velocidade máxima do vento em km/h, ou null se ausente. */
  windSpeedMaxKmh: number | null;
}

/** Estados válidos para cada seção meteorológica independente. */
export type SectionStatus = 'idle' | 'loading' | 'success' | 'error';

/** Dados e estado de uma seção que pode carregar ou falhar isoladamente. */
export interface WeatherSection<T> {
  /** Estado atual da seção. */
  status: SectionStatus;
  /** Dados válidos da seção, ou null quando indisponíveis. */
  data: T | null;
  /** Mensagem localizada de erro, ou null quando não há erro. */
  error: string | null;
}

/** Dados normalizados da cidade selecionada e suas seções independentes. */
export interface WeatherData {
  /** Cidade selecionada para a qual os dados foram solicitados. */
  city: City;
  /** Fuso IANA local retornado pela Forecast API. */
  timezone: string;
  /** Condições atuais e estado de carregamento/erro. */
  current: WeatherSection<CurrentWeather>;
  /** Previsão diária e estado de carregamento/erro. */
  forecast: WeatherSection<ForecastDay[]>;
}
