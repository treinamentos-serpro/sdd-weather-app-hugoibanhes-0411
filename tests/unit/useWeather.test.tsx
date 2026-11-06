import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, ForecastDay, WeatherData } from '../../src/types/weather';
import { useWeather } from '../../src/hooks/useWeather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

const LISBON: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.72,
  longitude: -9.13,
};

const PORTO: City = {
  id: 2,
  name: 'Porto',
  country: 'Portugal',
  admin1: 'Porto',
  latitude: 41.15,
  longitude: -8.61,
};

const FORECAST: ForecastDay[] = Array.from({ length: 5 }, (_, index) => ({
  date: `2026-06-${String(16 + index).padStart(2, '0')}`,
  available: true,
  weatherCode: 0,
  minTemperatureC: 10,
  maxTemperatureC: 20,
  precipitationMm: 0,
  windSpeedMaxKmh: 0,
}));

function weatherForCity(city: City): WeatherData {
  return {
    city,
    timezone: 'Europe/Lisbon',
    current: {
      status: 'success',
      data: {
        time: '2026-06-16T12:00',
        temperatureC: 20,
        weatherCode: 0,
        humidityPercent: 70,
        windSpeedKmh: 8,
        pressureHpa: 1014,
        precipitationMm: 0,
      },
      error: null,
    },
    forecast: { status: 'success', data: FORECAST, error: null },
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useWeather search lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('ignora uma busca vazia ou composta apenas por espaços', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(searchCities).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('mantém os resultados para seleção explícita sem carregar clima', async () => {
    vi.mocked(searchCities).mockResolvedValue([LISBON, PORTO]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Lisboa ');
    });

    expect(result.current.query).toBe('Lisboa');
    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([LISBON, PORTO]);
    expect(result.current.data).toBeNull();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('mantém os resultados da busca mais recente quando respostas chegam fora de ordem', async () => {
    const firstSearch = deferred<City[]>();
    const secondSearch = deferred<City[]>();
    vi.mocked(searchCities).mockImplementation((name) =>
      name === 'Lisboa' ? firstSearch.promise : secondSearch.promise,
    );
    const { result } = renderHook(() => useWeather());
    let firstRequest: Promise<void> = Promise.resolve();
    let secondRequest: Promise<void> = Promise.resolve();

    act(() => {
      firstRequest = result.current.search('Lisboa');
      secondRequest = result.current.search('Porto');
    });

    await act(async () => {
      secondSearch.resolve([PORTO]);
      await secondRequest;
    });
    await act(async () => {
      firstSearch.resolve([LISBON]);
      await firstRequest;
    });

    expect(result.current.query).toBe('Porto');
    expect(result.current.cities).toEqual([PORTO]);
    expect(result.current.status).toBe('success');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('repete a busca após erro e substitui o erro pelos resultados', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce([LISBON]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.cities).toEqual([LISBON]);
    expect(getWeather).not.toHaveBeenCalled();
  });
});

describe('useWeather weather orchestration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('carrega o clima para as coordenadas da cidade selecionada', async () => {
    vi.mocked(getWeather).mockImplementation(async (city) => weatherForCity(city));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(PORTO);
    });

    expect(getWeather).toHaveBeenCalledWith(PORTO);
    expect(result.current.status).toBe('success');
    expect(result.current.data?.city).toEqual(PORTO);
    expect(result.current.data?.current.status).toBe('success');
    expect(result.current.data?.forecast.status).toBe('success');
  });

  it('ignora respostas de uma cidade anterior que chegam atrasadas', async () => {
    const lisbonRequest = deferred<WeatherData>();
    const portoRequest = deferred<WeatherData>();
    vi.mocked(getWeather).mockImplementation((city) =>
      city.id === LISBON.id ? lisbonRequest.promise : portoRequest.promise,
    );
    const { result } = renderHook(() => useWeather());
    let lisbonSelection: Promise<void> = Promise.resolve();
    let portoSelection: Promise<void> = Promise.resolve();

    act(() => {
      lisbonSelection = result.current.selectCity(LISBON);
      portoSelection = result.current.selectCity(PORTO);
    });

    await act(async () => {
      portoRequest.resolve(weatherForCity(PORTO));
      await portoSelection;
    });
    await act(async () => {
      lisbonRequest.resolve(weatherForCity(LISBON));
      await lisbonSelection;
    });

    expect(getWeather).toHaveBeenNthCalledWith(1, LISBON);
    expect(getWeather).toHaveBeenNthCalledWith(2, PORTO);
    expect(result.current.data?.city).toEqual(PORTO);
  });

  it('repete somente forecast e preserva current válido', async () => {
    const partial = weatherForCity(LISBON);
    partial.forecast = {
      status: 'error',
      data: null,
      error: 'Não foi possível carregar a previsão.',
    };
    const forecastRetry = weatherForCity(LISBON);
    forecastRetry.current = { status: 'idle', data: null, error: null };
    vi.mocked(getWeather)
      .mockResolvedValueOnce(partial)
      .mockResolvedValueOnce(forecastRetry);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(LISBON);
    });
    const currentBeforeRetry = result.current.data?.current;

    await act(async () => {
      await result.current.retrySection('forecast');
    });

    expect(getWeather).toHaveBeenNthCalledWith(1, LISBON);
    expect(getWeather).toHaveBeenNthCalledWith(2, LISBON, 'forecast');
    expect(result.current.data?.current).toBe(currentBeforeRetry);
    expect(result.current.data?.forecast.status).toBe('success');
    expect(result.current.data?.forecast.data).toHaveLength(5);
  });
});