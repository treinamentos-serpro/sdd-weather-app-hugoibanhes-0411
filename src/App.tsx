import { useState } from 'react';
import type { Unit } from './types/weather';
import { useWeather } from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import CityResults from './components/CityResults';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import EmptyState from './components/states/EmptyState';

const UNIT_STORAGE_KEY = 'weather-app-unit';

interface UnitPreference {
  unit: Unit;
  storageAvailable: boolean;
}

function readUnitPreference(): UnitPreference {
  try {
    const storedUnit = window.localStorage.getItem(UNIT_STORAGE_KEY);
    return {
      unit: storedUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      storageAvailable: true,
    };
  } catch {
    return { unit: 'celsius', storageAvailable: false };
  }
}

/**
 * WeatherView — aplicação completa de previsão do tempo.
 *
 * Construída ao longo do treinamento de Spec-Driven Development com GitHub
 * Copilot, do briefing à entrega.
 */
export default function App() {
  const {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
    retrySection,
  } = useWeather();
  const [unitPreference, setUnitPreference] = useState(readUnitPreference);
  const unit = unitPreference.unit;
  const isSearching = status === 'loading' && cities.length === 0 && data === null;

  function handleUnitChange(nextUnit: Unit) {
    if (!unitPreference.storageAvailable) return;

    try {
      window.localStorage.setItem(UNIT_STORAGE_KEY, nextUnit);
      setUnitPreference({ unit: nextUnit, storageAvailable: true });
    } catch {
      setUnitPreference({ unit: 'celsius', storageAvailable: false });
    }
  }

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <span className="text-lg font-bold">WeatherView</span>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              onSearch={search}
              disabled={status === 'loading'}
              loading={isSearching}
            />
            <UnitToggle unit={unit} onChange={handleUnitChange} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {status === 'idle' && (
          <EmptyState
            title="Busque uma cidade para começar"
            hint="Ex.: Seattle, Lisboa, São Paulo…"
          />
        )}

        {status === 'loading' && !isSearching && <LoadingState />}

        {status === 'empty' && (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${query}"`}
            hint="Verifique a grafia e tente novamente."
            role="status"
          />
        )}

        {status === 'error' && error && <ErrorState message={error} onRetry={retry} />}

        {status === 'success' && !data && cities.length > 0 && (
          <CityResults cities={cities} onSelect={selectCity} />
        )}

        {status === 'success' && data && (
          <>
            {data.current.status === 'success' && data.current.data && (
              <CurrentWeather city={data.city} current={data.current.data} unit={unit} />
            )}
            {data.current.status === 'loading' && (
              <CurrentWeather city={data.city} unit={unit} status="loading" />
            )}
            {data.current.status === 'error' && (
              <CurrentWeather
                city={data.city}
                unit={unit}
                status="error"
                error={data.current.error ?? 'Não foi possível carregar o clima atual.'}
                onRetry={() => retrySection('current')}
              />
            )}
            {data.forecast.status === 'success' && data.forecast.data && (
              <ForecastList forecast={data.forecast.data} unit={unit} />
            )}
            {data.forecast.status === 'loading' && <ForecastList status="loading" unit={unit} />}
            {data.forecast.status === 'error' && (
              <ForecastList
                status="error"
                unit={unit}
                error={data.forecast.error ?? 'Não foi possível carregar a previsão.'}
                onRetry={() => retrySection('forecast')}
              />
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-white/60">
        Dados por{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-accent-400 hover:underline"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
