import {CacheStore} from "../types/cache-store";

type CacheEntry = {
    value: string;
    expiresAt?: number;
    timer?: ReturnType<typeof setTimeout>;
};

export default class MemoryCache implements CacheStore {
    private store = new Map<string, CacheEntry>();

    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (typeof entry.expiresAt === "number" && Date.now() >= entry.expiresAt) {
            this.removeEntry(key, entry);
            return null;
        }

        return entry.value;
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        const prev = this.store.get(key);
        if (prev?.timer) clearTimeout(prev.timer);

        const entry: CacheEntry = { value };

        if (ttl && ttl > 0) {
            const ms = this.ttlToMs(ttl);
            entry.expiresAt = Date.now() + ms;
            entry.timer = setTimeout(() => {
                this.store.delete(key);
            }, ms);
        }

        this.store.set(key, entry);
    }

    async delete(key: string): Promise<void> {
        const entry = this.store.get(key);
        this.removeEntry(key, entry);
    }

    async clear(): Promise<void> {
        this.store.forEach((entry) => {
            if (entry.timer) clearTimeout(entry.timer);
        });
        this.store.clear();
    }

    private removeEntry(key: string, entry?: CacheEntry) {
        if (entry?.timer) clearTimeout(entry.timer);
        this.store.delete(key);
    }

    private ttlToMs(ttl: number): number {
        return ttl * 1000;
    }
}