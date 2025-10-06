import { SQL } from "bun";

let db: SQL | null = null;

export function getDatabase(): SQL {
    if (db) return db;

    let dbFilename = process.env.DB_FILENAME || 'jikan-db.sqlite3';
    db = new SQL(dbFilename, { adapter: "sqlite" });
    return db
}