/**
 * Safely parses a JSON value to a given type, with a fallback if parsing fails.
 * Accepts already-parsed objects/arrays and returns them as-is.
 * @template T
 * @param {any} value - The value to parse (string or object).
 * @param {T} fallback - Fallback value returned on failure or invalid input.
 * @returns {T} Parsed value or the fallback.
 */
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

/**
 * Converts a value into a boolean. Accepts true, 1, and "1" as truthy.
 * @param {any} value - The input value.
 * @returns {boolean} True if the value is considered truthy, otherwise false.
 */
export function toBool(value: any): boolean {
    return value === true || value === 1 || value === "1";
}

/**
 * Converts a value to a number, returning a fallback if conversion fails.
 * @param {any} value - The input value.
 * @param {number} [fallback=0] - The fallback number when conversion fails.
 * @returns {number} Parsed number or the fallback.
 */
export function toNumber(value: any, fallback = 0): number {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Converts a value to a number or null if conversion fails.
 * @param {any} value - The input value.
 * @returns {number | null} Parsed number or null.
 */
export function toNullableNumber(value: any): number | null {
    if (value == null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

/**
 * Converts a value to a non-empty string or null if empty/undefined.
 * @param {any} value - The input value.
 * @returns {string | null} Non-empty string or null.
 */
export function nullableString(value: any): string | null {
    if (value == null) return null;
    const s = String(value);
    return s.length ? s : null;
}

/**
 * Normalizes title objects ensuring a non-empty list with a fallback title.
 * Each entry has the shape: { type: string, title: string }.
 * @param {any} raw - Raw titles value (stringified JSON or array).
 * @param {string} fallbackTitle - Fallback title when data is missing.
 * @returns {any} Normalized array of title objects.
 */
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