import { Database } from "bun:sqlite";

let db: Database | null = null;

/**
 * Lazily initializes and returns a singleton SQLite Database instance.
 * Uses the DB_FILENAME environment variable or defaults to 'database.sqlite'.
 *
 * Caches a Database instance on first call; subsequent calls return the same instance.
 *
 * @returns {Database} The Bun SQLite Database instance.
 */
export function getDatabase(): Database {
    if (db) return db;

    let dbFilename = process.env.DB_FILENAME || 'database.sqlite';
    db = new Database(dbFilename);
    return db!!;
}