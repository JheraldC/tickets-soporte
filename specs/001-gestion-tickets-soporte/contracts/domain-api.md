# Contrato: interfaces entre capas

Firmas de TypeScript que separan interfaz (`src/ui`), lógica de negocio (`src/domain`) y almacenamiento (`src/storage`). Son el contrato que las pruebas de Vitest verifican; los nombres de archivo son orientativos.

## Almacenamiento → dominio

```ts
// src/domain/ports.ts
export interface TicketRepository {
  /** Devuelve todos los tickets guardados. Puede informar avisos de lectura. */
  load(): { tickets: Ticket[]; warning?: StorageError };
  /** Reemplaza la colección guardada. Lanza StorageError('write-failed') si no puede. */
  saveAll(tickets: readonly Ticket[]): void;
}

export class StorageError extends Error {
  constructor(public readonly kind: 'corrupted' | 'partial' | 'write-failed' | 'unavailable', message?: string);
}

export interface Clock { now(): Date }
export interface IdGenerator { next(): string }
```

Implementaciones:

- `src/storage/localStorageRepository.ts` → `createLocalStorageRepository(storage?: Storage, key?: string): TicketRepository` (sigue [storage-schema.md](./storage-schema.md)).
- `src/storage/memoryRepository.ts` → `createMemoryRepository(initial?: Ticket[]): TicketRepository` (pruebas y modo sin almacenamiento).

## Servicio de dominio → interfaz

```ts
// src/domain/ticketService.ts
export interface TicketService {
  list(): readonly Ticket[];                         // orden creadoEn desc
  get(id: string): Ticket | undefined;
  create(input: TicketInput): Result<Ticket, ValidationErrors>;
  update(id: string, input: TicketInput): Result<Ticket, ValidationErrors | 'not-found'>;
  changeStatus(id: string, estado: Estado): Result<Ticket, 'not-found' | 'invalid-status'>;
  remove(id: string): Result<void, 'not-found'>;
  query(criteria: TicketQuery): readonly Ticket[];
  stats(): Estadisticas;
  subscribe(listener: (tickets: readonly Ticket[]) => void): () => void;
}

export function createTicketService(deps: {
  repository: TicketRepository; clock?: Clock; ids?: IdGenerator;
}): TicketService;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

Comportamiento obligatorio:

- `create` y `update` usan `validateTicketInput` (ver [data-model.md](../data-model.md)); si falla, no tocan el repositorio.
- Toda mutación exitosa llama a `repository.saveAll` antes de notificar a los suscriptores. Si `saveAll` lanza `StorageError`, el estado en memoria vuelve al anterior y el error se propaga a la UI.
- `changeStatus` al mismo estado devuelve `ok` sin guardar ni notificar.

## Funciones puras del dominio

```ts
// src/domain/validation.ts
export function validateTicketInput(input: TicketInput): Result<TicketInputValido, ValidationErrors>;
// src/domain/query.ts
export function normalizeText(s: string): string;
export function filterTickets(tickets: readonly Ticket[], q: TicketQuery): Ticket[];
// src/domain/stats.ts
export function computeStats(tickets: readonly Ticket[]): Estadisticas;
// src/domain/status.ts
export function applyStatusChange(t: Ticket, estado: Estado, now: Date): Ticket;
```

## Reglas de dependencia

- `src/domain/**` no importa nada de `src/ui/**` ni `src/storage/**`, ni usa `document`, `window` o `localStorage`.
- `src/storage/**` solo importa tipos de `src/domain/**`.
- `src/ui/**` usa el `TicketService`; nunca accede a localStorage directamente.
- `src/main.ts` es el único punto que conecta las tres capas.
