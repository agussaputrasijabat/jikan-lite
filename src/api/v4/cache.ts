import {CacheStore} from "./types/cache-store";
import {RedisCache} from "./cache/redis";
import MemoryCache from "./cache/memory";

const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600;
const CACHE_ENABLED = process.env.CACHE_ENABLED === 'true';

/**
 * Returns a cache store instance based on the CACHE_STORE environment variable.
 * Supports 'redis' and 'memory' stores.
 *
 * Checks the CACHE_STORE env var and instantiates the corresponding cache implementation, or throws if unsupported.
 *
 * @returns {CacheStore} The selected cache store instance.
 * @throws {Error} If CACHE_STORE is not set to a supported value.
 */
function getCacheStore(): CacheStore {
    if (process.env.CACHE_STORE === 'redis') {
        return new RedisCache();
    } else if (process.env.CACHE_STORE === 'memory') {
        return new MemoryCache();
    }

    throw new Error(`No cache store configured for "${process.env.CACHE_STORE}". Please set CACHE_STORE environment variable to 'redis' or 'memory'.`);
}

/**
 * Stores a value in the configured cache store.
 * No-ops when CACHE_ENABLED is not 'true'.
 *
 * When caching is enabled, it resolves a cache store via getCacheStore() and delegates the set with TTL; otherwise it returns immediately.
 *
 * @param {string} key - The cache key.
 * @param {string} value - The value to store (stringified JSON recommended).
 * @param {number} [ttl=CACHE_TTL] - Time-to-live in seconds.
 * @returns {Promise<void>}
 */
export function setCache(key: string, value: string, ttl: number = CACHE_TTL): Promise<void> {
    if (!CACHE_ENABLED) {
        return Promise.resolve();
    }

    const store = getCacheStore();
    return store.set(key, value, ttl);
}

/**
 * Retrieves a value by key from the configured cache store.
 * No-ops and returns null when CACHE_ENABLED is not 'true'.
 *
 * If caching is enabled, obtains the store via getCacheStore() and calls get(key); otherwise returns null immediately.
 *
 * @param {string} key - The cache key.
 * @returns {Promise<string | null>} The cached value or null if missing/disabled.
 */
export function getCache(key: string): Promise<string | null> {
    if (!CACHE_ENABLED) {
        return Promise.resolve(null);
    }

    const store = getCacheStore();
    return store.get(key);
}

/**
 * Deletes a value by key from the configured cache store.
 * No-ops when CACHE_ENABLED is not 'true'.
 *
 * Returns immediately if caching is disabled; otherwise resolves the store and calls delete(key).
 *
 * @param {string} key - The cache key.
 * @returns {Promise<void>}
 */
export function deleteCache(key: string): Promise<void> {
    if (!CACHE_ENABLED) {
        return Promise.resolve();
    }

    const store = getCacheStore();
    return store.delete(key);
}

/**
 * Clears the configured cache store.
 * No-ops when CACHE_ENABLED is not 'true'.
 *
 * When enabled, resolves the cache store and calls clear(); otherwise returns immediately.
 *
 * @returns {Promise<void>}
 */
export function clearCache(): Promise<void> {
    if (!CACHE_ENABLED) {
        return Promise.resolve();
    }

    const store = getCacheStore();
    return store.clear();
}