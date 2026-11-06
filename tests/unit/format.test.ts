import { afterEach, describe, it, expect, vi } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('format', () => {
  it('rotula o primeiro e o segundo dia', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('usa dia da semana para os demais', () => {
    // 2026-06-18 é uma quinta-feira.
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
  });

  it('formata a data local com dia e mês preenchidos', () => {
    expect(getShortDate('2026-06-16')).toBe('16/06/2026');
    expect(getShortDate('2026-06-03')).toBe('03/06/2026');
  });

  it('preserva a data de calendário mesmo em um fuso distante de UTC', () => {
    vi.stubEnv('TZ', 'Pacific/Honolulu');

    expect(getShortDate('2026-01-01')).toBe('01/01/2026');
    expect(getDayLabel('2026-01-01', 2)).toBe('Qui');
  });
});
