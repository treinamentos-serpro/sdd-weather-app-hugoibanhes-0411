import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';
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