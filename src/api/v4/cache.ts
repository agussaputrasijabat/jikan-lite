import {CacheStore} from "./types/cache-store";
import {RedisCache} from "./cache/redis";
import MemoryCache from "./cache/memory";

const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600;

function getCacheStore(): CacheStore {
    if (process.env.CACHE_STORE === 'redis') {
        return new RedisCache();
    } else if (process.env.CACHE_STORE === 'memory') {
        return new MemoryCache();
    }

    throw new Error(`No cache store configured for "${process.env.CACHE_STORE}". Please set CACHE_STORE environment variable to 'redis' or 'memory'.`);
}

export function setCache(key: string, value: string, ttl: number = CACHE_TTL): Promise<void> {
    const store = getCacheStore();
    return store.set(key, value, ttl);
}

export function getCache(key: string): Promise<string | null> {
    const store = getCacheStore();
    return store.get(key);
}

export function deleteCache(key: string): Promise<void> {
    const store = getCacheStore();
    return store.delete(key);
}

export function clearCache(): Promise<void> {
    const store = getCacheStore();
    return store.clear();
}