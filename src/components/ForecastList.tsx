import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';

type ForecastListProps =
  | { status: 'loading'; unit: Unit }
  | { status: 'error'; unit: Unit; error: string; onRetry: () => void }
  | { status?: 'success'; forecast: ForecastDay[]; unit: Unit };

/** Grid responsivo com a previsão de 5 dias. */
export default function ForecastList(props: ForecastListProps) {
  if (props.status === 'loading') {
    return (
      <section aria-label="Previsão de 5 dias">
        <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
        <LoadingState message="Carregando previsão" />
      </section>
    );
  }

  if (props.status === 'error') {
    return (
      <section aria-label="Previsão de 5 dias">
        <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
        <ErrorState message={props.error} onRetry={props.onRetry} />
      </section>
    );
  }

  const { forecast, unit } = props;

  return (
    <section aria-label="Previsão de 5 dias">
      <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard key={day.date} day={day} index={index} unit={unit} />
        ))}
      </ul>
    </section>
  );
}
