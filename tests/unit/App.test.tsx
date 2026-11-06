import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, ForecastDay, WeatherData } from '../../src/types/weather';

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
  weatherCode: index,
  minTemperatureC: 10 + index,
  maxTemperatureC: 20 + index,
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

async function searchAndSelect(city: City) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), city.name);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  await user.click(
    await screen.findByRole('button', { name: `${city.name}, ${city.admin1}, ${city.country}` }),
  );
  return user;
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(searchCities).mockResolvedValue([LISBON, PORTO]);
    vi.mocked(getWeather).mockImplementation(async (city) => weatherForCity(city));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza a marca e o convite inicial sem estado de resultados', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('mostra busca e alternador de unidade', () => {
    render(<App />);
    expect(screen.getByRole('textbox', { name: /buscar cidade/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('apresenta loading semântico na busca enquanto aguarda resultados', async () => {
    let resolveSearch: (cities: City[]) => void = () => {};
    vi.mocked(searchCities).mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    resolveSearch([LISBON]);
    expect(await screen.findByRole('list', { name: 'Resultados da busca' })).toBeInTheDocument();
  });

  it('apresenta resultados sem seleção automática e carrega a cidade escolhida', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('list', { name: 'Resultados da busca' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Portugal/ })).toHaveLength(2);
    expect(getWeather).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Porto, Porto, Portugal' }));

    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledWith(PORTO);
    expect(screen.getByRole('heading', { name: 'Porto' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
  });

  it('mantém a seção válida visível e repete somente a seção de previsão', async () => {
    const partial = weatherForCity(LISBON);
    partial.forecast = {
      status: 'error',
      data: null,
      error: 'Não foi possível carregar a previsão.',
    };
    const recovered = weatherForCity(LISBON);
    recovered.current = { status: 'idle', data: null, error: null };
    vi.mocked(getWeather)
      .mockResolvedValueOnce(partial)
      .mockResolvedValueOnce(recovered);

    render(<App />);
    await searchAndSelect(LISBON);
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a previsão');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(LISBON, 'forecast');
    expect(screen.getByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('aplica C/F em clima atual e forecast sem nova consulta e salva somente a unidade', async () => {
    render(<App />);
    const user = await searchAndSelect(LISBON);
    const currentSection = await screen.findByRole('region', { name: 'Clima atual' });
    const forecastSection = screen.getByRole('region', { name: 'Previsão de 5 dias' });

    expect(within(currentSection).getByText('20°')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(within(currentSection).getByText('68°')).toBeInTheDocument();
    expect(within(forecastSection).getByText('50°')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(within(currentSection).getByText('20°')).toBeInTheDocument();
    expect(within(forecastSection).getByText('10°')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();
    expect(Object.keys(window.localStorage)).toEqual(['weather-app-unit']);
  });

  it('restaura Fahrenheit após remontar a aplicação', async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    firstRender.unmount();

    render(<App />);
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('usa Celsius quando a preferência armazenada é inválida', () => {
    window.localStorage.setItem('weather-app-unit', 'kelvin');
    render(<App />);

    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('continua em Celsius e permite consultar quando a leitura do armazenamento falha', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    await searchAndSelect(LISBON);

    const currentSection = await screen.findByRole('region', { name: 'Clima atual' });
    expect(within(currentSection).getByText('20°')).toBeInTheDocument();
  });

  it('reverte para Celsius e continua a consulta quando a gravação falha', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    await searchAndSelect(LISBON);

    const currentSection = await screen.findByRole('region', { name: 'Clima atual' });
    expect(within(currentSection).getByText('20°')).toBeInTheDocument();
  });
});
