// A small in-memory cache for GET responses. Entries expire after a fixed time,
// and the whole cache is cleared when the app changes data (see checkout in
// services.ts). Nothing is stored in localStorage, so a reload starts fresh.

const DEFAULT_TTL_MS = 60_000;

type Entry = { value: unknown; expires: number };
const entries = new Map<string, Entry>();

/** Returns the cached value for `key`, or loads it and caches the result. */
export async function cached<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = entries.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await load();
  entries.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/** Drops every cached entry. Call after a change that makes cached data stale. */
export function clearCache(): void {
  entries.clear();
}
