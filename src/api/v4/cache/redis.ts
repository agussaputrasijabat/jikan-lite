import {RedisClient} from "bun";
import {CacheStore} from "../types/cache-store";

/**
 * A Redis-backed cache store implementation using Bun's Redis client.
 * Supports basic get/set/delete operations and optional TTL on set.
 */
export class RedisCache implements CacheStore {
    private readonly client: RedisClient

    /**
     * Creates a new RedisCache instance.
     * Uses the REDIS_URL environment variable for connection configuration.
     *
     * Instantiates Bun's RedisClient with the configured URL and stores it for use in cache operations.
     */
    constructor() {
        this.client = new RedisClient(process.env.REDIS_URL);
    }

    /**
     * Clears the cache. Not implemented for RedisCache to avoid accidental FLUSH.
     * Consider implementing with a key prefix strategy if needed.
     *
     * @returns {Promise<void>}
     */
    async clear(): Promise<void> {
        console.error("Clear method not implemented for RedisCache");
    }

    /**
     * Deletes a key from Redis.
     *
     * @param {string} key - The cache key to delete.
     * @returns {Promise<void>}
     */
    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Retrieves a cached value from Redis.
     * Any errors are swallowed and null is returned.
     *
     * @param {string} key - The cache key to read.
     * @returns {Promise<string | null>} The string value or null if not found or on error.
     */
    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    /**
     * Stores a value in Redis, optionally setting an expiry time.
     * @param {string} key - The cache key to set.
     * @param {string} value - The string value to store.
     * @param {number} [ttl] - Optional TTL in seconds.
     * @returns {Promise<void>}
     */
    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.client.set(key, value);
        if (ttl) {
            await this.client.expire(key, ttl);
        }
    }
}