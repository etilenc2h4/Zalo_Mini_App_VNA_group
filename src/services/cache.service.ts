interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export const getCached = <T>(key: string): T | null => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data as T;
};

export const setCached = <T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void => {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
};

export const clearCache = (prefix?: string): void => {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
};

