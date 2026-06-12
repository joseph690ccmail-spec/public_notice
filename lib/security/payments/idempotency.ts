export type IdempotencyScope = "paystack_webhook" | "payment_verify" | "notice_publish";

export interface IdempotencyRecord {
  key: string;
  scope: IdempotencyScope;
  processedAt: string;
  metadata?: Record<string, unknown>;
}

export interface IdempotencyStore {
  has(key: string, scope: IdempotencyScope): Promise<boolean>;
  mark(
    key: string,
    scope: IdempotencyScope,
    metadata?: Record<string, unknown>
  ): Promise<IdempotencyRecord>;
}

const memoryStore = new Map<string, IdempotencyRecord>();

function compositeKey(key: string, scope: IdempotencyScope): string {
  return `${scope}:${key}`;
}

/** In-memory store for local dev. Swap for Redis/KV in production via REDIS_URL. */
export const inMemoryIdempotencyStore: IdempotencyStore = {
  async has(key, scope) {
    return memoryStore.has(compositeKey(key, scope));
  },
  async mark(key, scope, metadata) {
    const record: IdempotencyRecord = {
      key,
      scope,
      processedAt: new Date().toISOString(),
      metadata,
    };
    memoryStore.set(compositeKey(key, scope), record);
    return record;
  },
};

let activeStore: IdempotencyStore = inMemoryIdempotencyStore;

export function setIdempotencyStore(store: IdempotencyStore): void {
  activeStore = store;
}

export function getIdempotencyStore(): IdempotencyStore {
  return activeStore;
}

export async function ensureNotProcessed(
  key: string,
  scope: IdempotencyScope
): Promise<void> {
  const exists = await activeStore.has(key, scope);
  if (exists) {
    const error = new Error(`Idempotency key already processed: ${scope}:${key}`);
    error.name = "IdempotencyConflict";
    throw error;
  }
}

export async function markProcessed(
  key: string,
  scope: IdempotencyScope,
  metadata?: Record<string, unknown>
): Promise<IdempotencyRecord> {
  return activeStore.mark(key, scope, metadata);
}

export function paymentReferenceKey(reference: string): string {
  return reference.trim();
}

export function draftPublishKey(draftId: string): string {
  return draftId.trim();
}