import { useCallback, useRef, useState } from 'react';
import type { City, WeatherData } from '../types/weather';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
  retrySection: (section: 'current' | 'forecast') => Promise<void>;
}

/**
 * Hook de orquestração: busca cidades, seleciona uma e carrega o clima.
 * Expõe uma máquina de estados simples (idle/loading/success/error/empty).
 */
export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lastCity, setLastCity] = useState<City | null>(null);
  const searchRequestId = useRef(0);
  const currentRequestId = useRef(0);
  const forecastRequestId = useRef(0);
  const selectedCityId = useRef<number | null>(null);

  const loadWeather = useCallback(async (city: City) => {
    selectedCityId.current = city.id;
    currentRequestId.current += 1;
    forecastRequestId.current += 1;
    const requestId = {
      current: currentRequestId.current,
      forecast: forecastRequestId.current,
    };
    setStatus('loading');
    setError(null);
    setLastCity(city);
    setData(null);
    try {
      const weather = await getWeather(city);
      if (
        selectedCityId.current !== city.id ||
        currentRequestId.current !== requestId.current ||
        forecastRequestId.current !== requestId.forecast
      ) {
        return;
      }
      setData(weather);
      setStatus('success');
    } catch (err) {
      if (
        selectedCityId.current !== city.id ||
        currentRequestId.current !== requestId.current ||
        forecastRequestId.current !== requestId.forecast
      ) {
        return;
      }
      setStatus('error');
      setError(toMessage(err));
    }
  }, []);

  const search = useCallback(async (name: string) => {
    const trimmed = name.trim();
    setQuery(trimmed);
    if (!trimmed) return;

    const requestId = ++searchRequestId.current;
    currentRequestId.current += 1;
    forecastRequestId.current += 1;
    selectedCityId.current = null;
    setLastCity(null);
    setData(null);
    setStatus('loading');
    setError(null);
    setCities([]);

    try {
      const results = await searchCities(trimmed);
      if (requestId !== searchRequestId.current) return;
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      setCities(results);
      await loadWeather(results[0]);
    } catch (err) {
      if (requestId !== searchRequestId.current) return;
      setStatus('error');
      setError(toMessage(err));
    }
  }, [loadWeather]);

  const selectCity = useCallback(
    async (city: City) => {
      searchRequestId.current += 1;
      await loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(async () => {
    if (lastCity) {
      await loadWeather(lastCity);
    } else if (query) {
      await search(query);
    }
  }, [lastCity, query, loadWeather, search]);

  const retrySection = useCallback(
    async (section: 'current' | 'forecast') => {
      const city = data?.city ?? lastCity;
      if (!data || !city || selectedCityId.current !== city.id) return;

      const requestId =
        section === 'current' ? ++currentRequestId.current : ++forecastRequestId.current;

      setData((currentData) => {
        if (!currentData || currentData.city.id !== city.id) return currentData;
        return section === 'current'
          ? { ...currentData, current: { ...currentData.current, status: 'loading', error: null } }
          : { ...currentData, forecast: { ...currentData.forecast, status: 'loading', error: null } };
      });

      try {
        const refreshed = await getWeather(city, section);
        const latestRequestId = section === 'current' ? currentRequestId.current : forecastRequestId.current;
        if (selectedCityId.current !== city.id || latestRequestId !== requestId) return;
        setData((currentData) => {
          if (!currentData || currentData.city.id !== city.id) return currentData;
          return section === 'current'
            ? { ...currentData, timezone: refreshed.timezone, current: refreshed.current }
            : { ...currentData, timezone: refreshed.timezone, forecast: refreshed.forecast };
        });
      } catch (err) {
        const latestRequestId = section === 'current' ? currentRequestId.current : forecastRequestId.current;
        if (selectedCityId.current !== city.id || latestRequestId !== requestId) return;
        setData((currentData) => {
          if (!currentData || currentData.city.id !== city.id) return currentData;
          const failedSection = {
            status: 'error' as const,
            data: null,
            error: toMessage(err),
          };
          return section === 'current'
            ? { ...currentData, current: failedSection }
            : { ...currentData, forecast: failedSection };
        });
      }
    },
    [data, lastCity],
  );

  return { status, data, cities, error, query, search, selectCity, retry, retrySection };
}

function toMessage(err: unknown): string {
  if (err instanceof WeatherServiceError) return err.message;
  return 'Algo deu errado. Tente novamente.';
}
