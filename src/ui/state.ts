import type { TicketQuery } from '../domain/types';

const initialQuery: TicketQuery = { texto: '', estado: 'todos', categoria: 'todas', prioridad: 'todas' };

export interface TicketQueryStore {
  getState(): TicketQuery;
  setState(next: Partial<TicketQuery>): void;
  reset(): void;
  subscribe(listener: (query: TicketQuery) => void): () => void;
}

export function createTicketQueryStore(): TicketQueryStore {
  let state = { ...initialQuery };
  const listeners = new Set<(query: TicketQuery) => void>();
  const notify = () => {
    const snapshot = { ...state };
    for (const listener of listeners) listener(snapshot);
  };
  return {
    getState: () => ({ ...state }),
    setState(next) {
      const updated = { ...state, ...next };
      if (Object.keys(updated).every((key) => updated[key as keyof TicketQuery] === state[key as keyof TicketQuery])) return;
      state = updated;
      notify();
    },
    reset() {
      if (Object.keys(initialQuery).every((key) => state[key as keyof TicketQuery] === initialQuery[key as keyof TicketQuery])) return;
      state = { ...initialQuery };
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
