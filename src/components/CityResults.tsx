import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

/** Lista opções geográficas; a escolha só ocorre após ativação explícita. */
export default function CityResults({ cities, onSelect }: CityResultsProps) {
  if (cities.length === 0) return null;

  return (
    <ul aria-label="Resultados da busca" className="space-y-2">
      {cities.map((city) => {
        const context = [city.admin1, city.country].filter(Boolean).join(', ');

        return (
          <li key={city.id}>
            <button
              type="button"
              aria-label={context ? `${city.name}, ${context}` : city.name}
              onClick={() => onSelect(city)}
              className="flex w-full flex-col rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <span className="font-semibold">{city.name}</span>
              {context && <span className="text-sm text-white/60">{context}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}