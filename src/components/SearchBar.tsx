import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/** Barra de busca de cidade. Bloqueia submit com input vazio. */
export default function SearchBar({ onSearch, disabled = false, loading = false }: SearchBarProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form
      role="search"
      aria-busy={loading}
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400">
        <span aria-hidden="true" className="text-white/50">
          🔍
        </span>
        <label htmlFor="city-search" className="sr-only">
          Buscar cidade
        </label>
        <input
          id="city-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar cidade…"
          autoComplete="off"
          disabled={disabled || loading}
          className="min-w-0 flex-1 bg-transparent text-white placeholder-white/60 outline-none"
        />
        {loading && (
          <span role="status" className="text-sm text-white/60">
            Carregando
          </span>
        )}
        <button
          type="submit"
          disabled={disabled || loading || !value.trim()}
          className="rounded-lg bg-accent-500 px-4 py-1.5 text-sm font-semibold text-night-900 transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
