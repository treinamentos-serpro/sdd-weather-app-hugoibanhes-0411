import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import type { ForecastDay } from '../../src/types/weather';

const FORECAST: ForecastDay[] = Array.from({ length: 5 }, (_, index) => ({
  date: `2026-06-${String(16 + index).padStart(2, '0')}`,
  available: true,
  weatherCode: index,
  minTemperatureC: index,
  maxTemperatureC: index + 10,
  precipitationMm: 0,
  windSpeedMaxKmh: 0,
}));

describe('ForecastList', () => {
  it('renderiza os cinco dias em ordem cronológica', () => {
    render(<ForecastList forecast={FORECAST} unit="celsius" />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    for (const [index, item] of items.entries()) {
      expect(item).toHaveTextContent(`2026`);
      expect(item).toHaveTextContent(`${index}°`);
      expect(item).toHaveTextContent(`${index + 10}°`);
    }
    expect(items[0]).toHaveTextContent('16/06/2026');
    expect(items[4]).toHaveTextContent('20/06/2026');
  });

  it('apresenta loading sem perder o nome da seção', () => {
    render(<ForecastList status="loading" unit="celsius" />);
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão');
  });

  it('apresenta erro e permite tentar novamente somente a seção', async () => {
    const onRetry = vi.fn();
    render(
      <ForecastList
        status="error"
        unit="celsius"
        error="Não foi possível carregar a previsão."
        onRetry={onRetry}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a previsão');
    expect(onRetry).toHaveBeenCalledOnce();
  });
});