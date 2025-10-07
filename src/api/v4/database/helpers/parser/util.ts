export function parseJSON<T>(value: any, fallback: T): T {
    if (value == null) return fallback;
    if (Array.isArray(value) || typeof value === "object") return value as T;
    if (typeof value !== "string" || value.trim() === "") return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

export function toBool(value: any): boolean {
    return value === true || value === 1 || value === "1";
}

export function toNumber(value: any, fallback = 0): number {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
}

export function toNullableNumber(value: any): number | null {
    if (value == null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

export function nullableString(value: any): string | null {
    if (value == null) return null;
    const s = String(value);
    return s.length ? s : null;
}

// ensure titles is non-empty and in the expected shape
export function parseTitles(raw: any, fallbackTitle: string): any {
    const arr = parseJSON<any[]>(raw, []);
    const normalized = Array.isArray(arr)
        ? arr.map(t => ({
            type: String(t?.type ?? "Default"),
            title: String(t?.title ?? fallbackTitle),
        }))
        : [];
    if (normalized.length === 0) {
        normalized.push({ type: "Default", title: fallbackTitle });
    }
    // return as any to satisfy possible tuple typing like `[ { type:string; title:string } ]`
    return normalized as any;
}