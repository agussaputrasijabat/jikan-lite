import {CacheStore} from "../types/cache-store";

/**
 * Represents a single in-memory cache entry.
 */
type CacheEntry = {
    value: string;
    expiresAt?: number;
    timer?: ReturnType<typeof setTimeout>;
};

/**
 * A simple in-memory cache implementation with optional TTL support.
 * Entries can be set with a TTL (in seconds). Expired entries are lazily
 * purged on access and proactively removed via a timeout when possible.
 */
export default class MemoryCache implements CacheStore {
    private store = new Map<string, CacheEntry>();

    /**
     * Retrieves a value from the cache by key.
     * If the entry has expired, it is removed and null is returned.
     *
     * Reads the in-memory Map by key; checks TTL and proactively deletes expired entries before returning.
     *
     * @param {string} key - Cache key to read.
     * @returns {Promise<string | null>} The cached string value or null if missing/expired.
     */
    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (typeof entry.expiresAt === "number" && Date.now() >= entry.expiresAt) {
            this.removeEntry(key, entry);
            return null;
        }

        return entry.value;
    }

    /**
     * Stores a value in the cache with an optional TTL.
     *
     * Writes the value to an internal Map; when ttl is provided, schedules expiration via setTimeout and records an expiresAt timestamp.
     *
     * @param {string} key - Cache key to set.
     * @param {string} value - Value to store (stringified if needed by caller).
     * @param {number} [ttl] - Optional time-to-live in seconds.
     * @returns {Promise<void>}
     */
    async set(key: string, value: string, ttl?: number): Promise<void> {
        const prev = this.store.get(key);
        if (prev?.timer) clearTimeout(prev.timer);

        const entry: CacheEntry = {value};

        if (ttl && ttl > 0) {
            const ms = this.ttlToMs(ttl);
            entry.expiresAt = Date.now() + ms;
            entry.timer = setTimeout(() => {
                this.store.delete(key);
            }, ms);
        }

        this.store.set(key, entry);
    }

    /**
     * Deletes a single cache entry by key.
     *
     * @param {string} key - Cache key to delete.
     * @returns {Promise<void>}
     */
    async delete(key: string): Promise<void> {
        const entry = this.store.get(key);
        this.removeEntry(key, entry);
    }

    /**
     * Clears all entries in the cache and cancels any scheduled expiration timers.
     *
     * @returns {Promise<void>}
     */
    async clear(): Promise<void> {
        this.store.forEach((entry) => {
            if (entry.timer) clearTimeout(entry.timer);
        });
        this.store.clear();
    }

    /**
     * Removes a cache entry and clears its timer if present.
     * @param {string} key - The cache key.
     * @param {CacheEntry} [entry] - The entry to remove.
     * @private
     */
    private removeEntry(key: string, entry?: CacheEntry) {
        if (entry?.timer) clearTimeout(entry.timer);
        this.store.delete(key);
    }

    /**
     * Converts TTL seconds to milliseconds.
     * @param {number} ttl - Time-to-live in seconds.
     * @returns {number} Milliseconds representation of TTL.
     * @private
     */
    private ttlToMs(ttl: number): number {
        return ttl * 1000;
    }
}