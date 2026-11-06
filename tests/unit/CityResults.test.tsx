import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CityResults from '../../src/components/CityResults';
import type { City } from '../../src/types/weather';

const CITIES: City[] = [
  {
    id: 1,
    name: 'Springfield',
    country: 'Estados Unidos',
    admin1: 'Illinois',
    latitude: 39.8,
    longitude: -89.6,
  },
  {
    id: 2,
    name: 'Springfield',
    country: 'Estados Unidos',
    admin1: 'Massachusetts',
    latitude: 42.1,
    longitude: -72.6,
  },
];

describe('CityResults', () => {
  it('apresenta o contexto geográfico sem selecionar uma cidade automaticamente', () => {
    const onSelect = vi.fn();
    render(<CityResults cities={CITIES} onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Springfield, Illinois, Estados Unidos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Springfield, Massachusetts, Estados Unidos/i })).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('seleciona a opção focada com o teclado', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CityResults cities={CITIES} onSelect={onSelect} />);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(CITIES[1]);
  });

  it('não renderiza uma lista vazia', () => {
    const { container } = render(<CityResults cities={[]} onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});