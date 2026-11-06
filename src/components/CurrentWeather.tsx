import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';

interface CurrentWeatherBaseProps {
  city: City;
  unit: Unit;
}

type CurrentWeatherProps =
  | (CurrentWeatherBaseProps & {
      status?: 'success';
      current: CurrentWeatherData;
    })
  | (CurrentWeatherBaseProps & { status: 'loading' })
  | (CurrentWeatherBaseProps & {
      status: 'error';
      error: string;
      onRetry: () => void;
    });

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather(props: CurrentWeatherProps) {
  if (props.status === 'loading') {
    return (
      <section aria-label="Clima atual">
        <LoadingState message="Carregando clima atual" />
      </section>
    );
  }

  if (props.status === 'error') {
    return (
      <section aria-label="Clima atual">
        <ErrorState message={props.error} onRetry={props.onRetry} />
      </section>
    );
  }

  const { city, current, unit } = props;
  const location = [city.admin1, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{city.name}</h2>
          {location && <p className="text-white/60">{location}</p>}

          <div className="mt-6 flex items-center gap-4">
            <span aria-hidden="true" className="text-6xl">
              {current.weatherCode === null ? '🌡️' : getWeatherIcon(current.weatherCode)}
            </span>
            <span className="text-6xl font-light md:text-7xl">
              {current.temperatureC === null
                ? 'Não disponível'
                : formatTemperature(current.temperatureC, unit)}
            </span>
          </div>
          <p className="mt-2 text-white/70">
            {current.weatherCode === null
              ? 'Não disponível'
              : getWeatherLabel(current.weatherCode)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            icon="💧"
            label="Umidade"
            value={current.humidityPercent === null ? 'Não disponível' : `${Math.round(current.humidityPercent)}%`}
          />
          <Metric
            icon="💨"
            label="Vento"
            value={current.windSpeedKmh === null ? 'Não disponível' : `${Math.round(current.windSpeedKmh)} km/h`}
          />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={current.precipitationMm === null ? 'Não disponível' : `${current.precipitationMm} mm`}
          />
          <Metric
            icon="📊"
            label="Pressão"
            value={current.pressureHpa === null ? 'Não disponível' : `${Math.round(current.pressureHpa)} hPa`}
          />
        </div>
      </div>
    </section>
  );
}
