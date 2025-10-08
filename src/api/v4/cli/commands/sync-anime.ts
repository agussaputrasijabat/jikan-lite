import {Anime} from "../../types";
import {getDatabase} from "../../database";
import AnimeService from "../../services/anime-service";
import {AnimeRepository} from "../../database/repository/anime-repository";
import {promises as fs} from "fs";
import * as path from "node:path";

const IDS_URL =
    "https://raw.githubusercontent.com/purarue/mal-id-cache/refs/heads/master/cache/anime_cache.json";

// simple progress storage on disk (project root)
const PROGRESS_FILE = path.join(process.cwd(), ".jikan-lite-progress.json");

type ProgressShape = {
    anime?: {
        lastIndex: number; // last processed overall index in the ID list
        updatedAt: string;
    };
};

/**
 * Reads the progress of anime synchronization from disk.
 * Returns the last processed index and update timestamp if available.
 * @returns {Promise<ProgressShape>} The progress data or an empty object if not found.
 */
async function readProgress(): Promise<ProgressShape> {
    try {
        const data = await fs.readFile(PROGRESS_FILE, "utf8");
        return JSON.parse(data) as ProgressShape;
    } catch {
        return {} as ProgressShape;
    }
}

/**
 * Writes the current progress of anime synchronization to disk.
 * Updates the last processed index and timestamp for the given kind.
 * @param {keyof ProgressShape} kind - The progress type to update.
 * @param {number} lastIndex - The last processed index.
 * @returns {Promise<void>}
 */
async function writeProgress(kind: keyof ProgressShape, lastIndex: number) {
    const prev = await readProgress();
    const now = new Date().toISOString();
    const next: ProgressShape = {
        ...prev,
        [kind]: {lastIndex, updatedAt: now} as any,
    };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(next, null, 2), "utf8");
}

/**
 * Parses CLI flags from the provided argument array.
 * Supports --limit, --from-index, --force-update, and --resume.
 * @param {string[]} argv - The CLI arguments.
 * @returns {object} Parsed flags.
 */
function parseFlags(argv: string[]) {
    const flags: { limit?: number; fromIndex?: number; forceUpdate?: boolean; resume?: boolean } = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--limit") flags.limit = Number(argv[++i]);
        else if (a === "--from-index") flags.fromIndex = Number(argv[++i]);
        else if (a === "--force-update") flags.forceUpdate = true;
        else if (a === "--resume") flags.resume = true;
    }
    return flags;
}

/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetches JSON data from a URL with retry and exponential backoff.
 * Throws the last error if all retries fail.
 * @param {string} url - The URL to fetch.
 * @param {number} [retries=3] - Number of retry attempts.
 * @param {number} [backoffMs=500] - Initial backoff in milliseconds.
 * @returns {Promise<any>} The fetched JSON data.
 * @throws {Error} If all retries fail.
 */
async function fetchWithRetry(url: string, retries = 3, backoffMs = 500): Promise<any> {
    let lastErr: unknown;
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, {headers: {"User-Agent": "jikan-lite-cli"}});
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            lastErr = e;
            if (i === retries) break;
            await sleep(backoffMs * (i + 1));
        }
    }
    throw lastErr;
}

/**
 * Synchronizes anime data from the MAL ID list to the local database.
 * Downloads the ID list, processes each anime, and updates progress.
 * Supports options for limiting, resuming, and forcing updates.
 * @param {string[]} argv - CLI arguments for sync options.
 * @returns {Promise<void>}
 */
export async function runSyncAnime(argv: string[]) {
    const {limit, fromIndex = 0, forceUpdate = false, resume = false} = parseFlags(argv);

    console.log(`[sync:anime] Starting...`);
    console.log(`[sync:anime] Options => fromIndex=${fromIndex}, limit=${limit ?? '∞'}, forceUpdate=${forceUpdate}, resume=${resume}`);

    // Load ID list
    console.log(`[sync:anime] Downloading MAL ID list from: ${IDS_URL}`);
    const idsResp: any = await fetchWithRetry(IDS_URL);
    type IdsResponse = { sfw?: number[]; nsfw?: number[] } | number[];
    const normalized: number[] = Array.isArray(idsResp)
        ? (idsResp as number[])
        : [
            ...(((idsResp as IdsResponse as any)?.sfw ?? []) as number[]),
            ...(((idsResp as IdsResponse as any)?.nsfw ?? []) as number[]),
        ];
    const idList: number[] = normalized.filter((v) => typeof v === "number");

    // Determine start index considering resume option
    let startIndex = fromIndex;
    if (resume) {
        const prog = await readProgress();
        const saved = prog?.anime?.lastIndex;
        if (typeof saved === "number" && saved >= -1) {
            startIndex = Math.max(startIndex, saved + 1);
        }
    }

    const slice = typeof limit === "number" ? idList.slice(startIndex, startIndex + limit) : idList.slice(startIndex);
    console.log(`[sync:anime] Total IDs available: ${idList.length}; Starting at index ${startIndex}; To process: ${slice.length}`);

    const db = getDatabase();
    const repo = new AnimeRepository(db);
    const service = new AnimeService(repo);

    let processed = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < slice.length; i++) {
        const malId = slice[i];
        const currentIndex = startIndex + i;
        const start = Date.now();
        try {
            let exists = await service.findById(malId);
            if (exists && !forceUpdate) {
                skipped++;
                processed++;
                console.log(`- [skip] [#${currentIndex}] ${malId} already exists`);
            } else {
                const json = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${malId}`);
                const anime = (json?.data ?? null) as Anime | null;
                if (!anime) throw new Error("No data field in response");

                if (exists) {
                    await service.update(malId, anime as unknown as Partial<Anime>);
                    updated++;
                    console.log(`- [update] [#${currentIndex}] ${malId} ${anime.title ?? ''}`);
                } else {
                    await service.create(anime);
                    created++;
                    console.log(`- [create] [#${currentIndex}] ${malId} ${anime.title ?? ''}`);
                }
                processed++;
            }
        } catch (e) {
            failed++;
            console.error(`- [error] [#${currentIndex}] ${malId}:`, e);
        } finally {
            // persist last processed index
            try {
                await writeProgress("anime", currentIndex);
            } catch {
            }
        }

        // Ensure 1 second delay between each sync iteration
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        if (remaining > 0) await sleep(remaining);
    }

    console.log(`[sync:anime] Done. Processed=${processed} created=${created} updated=${updated} skipped=${skipped} failed=${failed}`);
}