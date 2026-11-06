import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import type { ForecastDay } from '../../src/types/weather';

const DAY: ForecastDay = {
  date: '2026-06-16',
  available: true,
  weatherCode: 1,
  minTemperatureC: 0,
  maxTemperatureC: 20,
  precipitationMm: 0,
  windSpeedMaxKmh: 0,
};

describe('ForecastCard', () => {
  it('mostra data, condição, métricas e conversão de temperatura', () => {
    render(<ForecastCard day={DAY} index={0} unit="fahrenheit" />);

    expect(screen.getByText('16/06/2026')).toBeInTheDocument();
    expect(screen.getByText('Predomínio de sol')).toBeInTheDocument();
    expect(screen.getByText('32°')).toBeInTheDocument();
    expect(screen.getByText('68°')).toBeInTheDocument();
    expect(screen.getByText(/0 mm/)).toBeInTheDocument();
    expect(screen.getByText(/0 km\/h/)).toBeInTheDocument();
  });

  it('apresenta fallback para cada métrica ausente', () => {
    const day = { ...DAY, weatherCode: null, minTemperatureC: null, maxTemperatureC: null, precipitationMm: null, windSpeedMaxKmh: null };
    render(<ForecastCard day={day} index={0} unit="celsius" />);

    expect(screen.getAllByText(/Não disponível/)).toHaveLength(5);
  });

  it('preserva a data de um dia sem métricas', () => {
    render(
      <ForecastCard
        day={{ ...DAY, available: false, weatherCode: null, minTemperatureC: null, maxTemperatureC: null, precipitationMm: null, windSpeedMaxKmh: null }}
        index={0}
        unit="celsius"
      />,
    );

    expect(screen.getByText('16/06/2026')).toBeInTheDocument();
    expect(screen.getByText('Previsão indisponível')).toBeInTheDocument();
  });
});