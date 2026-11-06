import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.72,
  longitude: -9.13,
};

const CURRENT: CurrentWeatherData = {
  time: '2026-06-16T12:00',
  temperatureC: 20,
  weatherCode: 0,
  humidityPercent: 0,
  windSpeedKmh: 0,
  pressureHpa: null,
  precipitationMm: 0,
};

describe('CurrentWeather', () => {
  it('mostra métricas disponíveis, preserva zero e sinaliza dados ausentes', () => {
    render(<CurrentWeather city={CITY} current={CURRENT} unit="fahrenheit" />);

    expect(screen.getByText('68°')).toBeInTheDocument();
    expect(screen.getByText('Céu limpo')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('Não disponível')).toBeInTheDocument();
  });

  it('apresenta fallback para cada métrica ausente', () => {
    const emptyCurrent = {
      ...CURRENT,
      temperatureC: null,
      weatherCode: null,
      humidityPercent: null,
      windSpeedKmh: null,
      pressureHpa: null,
      precipitationMm: null,
    };
    render(<CurrentWeather city={CITY} current={emptyCurrent} unit="celsius" />);

    expect(screen.getAllByText('Não disponível')).toHaveLength(6);
  });

  it('apresenta estado de carregamento', () => {
    render(<CurrentWeather city={CITY} unit="celsius" status="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando clima atual');
  });

  it('apresenta erro e encaminha retry da seção', async () => {
    const onRetry = vi.fn();
    render(
      <CurrentWeather
        city={CITY}
        unit="celsius"
        status="error"
        error="Não foi possível carregar o clima atual."
        onRetry={onRetry}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
    expect(onRetry).toHaveBeenCalledOnce();
  });
});