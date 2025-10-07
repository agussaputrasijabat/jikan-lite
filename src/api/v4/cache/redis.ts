import {RedisClient} from "bun";
import {CacheStore} from "../types/cache-store";

export class RedisCache implements CacheStore {
    private readonly client: RedisClient

    constructor() {
        this.client = new RedisClient(process.env.REDIS_URL);
    }

    async clear(): Promise<void> {
        console.error("Clear method not implemented for RedisCache");
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.client.set(key, value);
        if (ttl) {
            await this.client.expire(key, ttl);
        }
    }
}