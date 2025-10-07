import { Database } from "bun:sqlite";

let db: Database | null = null;

export function getDatabase(): Database {
    if (db) return db;

    let dbFilename = process.env.DB_FILENAME || 'database.sqlite';
    db = new Database(dbFilename);
    return db!!;
}