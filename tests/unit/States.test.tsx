import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('componentes de estado', () => {
  it('expõe busca sem resultados como status, sem anunciar convite inicial', () => {
    const { rerender } = render(<EmptyState title="Busque uma cidade para começar" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<EmptyState title="Nenhuma cidade encontrada" role="status" />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
  });

  it('expõe loading com texto acessível em português', () => {
    render(<LoadingState message="Carregando" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('expõe erro e executa a ação de retry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="A solicitação expirou." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('A solicitação expirou.');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});