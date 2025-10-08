import {Database} from "bun:sqlite";
import {QueryOptions, Repository} from "../types/repository";
import {Anime} from "../../types";
import "../helpers/parser/anime"

/**
 * Repository for CRUD operations on Anime entities backed by SQLite.
 */
export class AnimeRepository implements Repository<Anime> {
    private db: Database;

    /**
     * Creates a new AnimeRepository.
     * @param {Database} db - The Bun SQLite database instance.
     */
    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Finds a single Anime by MAL ID.
     *
     * Prepares and executes a SELECT query by mal_id; maps the row to an Anime via toAnime(); returns null if not found.
     *
     * @param {number} id - The MAL ID.
     * @returns {Anime | null} The Anime if found, otherwise null.
     */
    findById(id: number): Anime | null {
        const stmt = this.db.prepare("SELECT * FROM anime WHERE mal_id = ?");
        const anime = stmt.get(id);

        if (!anime) return null;

        return anime.toAnime();
    }

    /**
     * Inserts a new Anime row.
     *
     * Builds an INSERT statement from the Anime instance, runs it against the DB, and returns the original entity.
     *
     * @param {Anime} item - The Anime entity to persist.
     * @returns {Anime} The same Anime instance.
     * @throws {Error} If the Anime cannot produce a valid insert SQL.
     */
    create(item: Anime): Anime {
        let sqlInsert = item.toAnimeInsertSQL();
        if (!sqlInsert) throw new Error("Invalid Anime object");

        const stmt = this.db.prepare(sqlInsert.sql);
        stmt.run(...sqlInsert.params);
        return item;
    }

    /**
     * Deletes an Anime by MAL ID.
     *
     * Executes a DELETE statement by mal_id and returns whether any row was affected.
     *
     * @param {number} id - The MAL ID.
     * @returns {boolean} True if a row was removed.
     */
    delete(id: number): boolean {
        const stmt = this.db.prepare("DELETE FROM anime WHERE mal_id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Retrieves all Anime rows.
     *
     * Runs a SELECT * query; converts each row with toAnime(); returns an empty array when no rows exist.
     *
     * @returns {Anime[]} Array of Anime entities; empty if none.
     */
    findAll(): Anime[] {
        const stmt = this.db.prepare("SELECT * FROM anime");
        const animeList = stmt.all();
        if (animeList.length === 0) {
            return [];
        }

        return animeList.map((anime) => anime!!.toAnime());
    }

    /**
     * Finds anime by complex query options (not implemented).
     *
     * Placeholder for future implementation; currently returns an empty array regardless of the input options.
     *
     * @param {QueryOptions} options - Query parameters.
     * @returns {Anime[]} Currently always returns an empty array.
     */
    findByQuery(options: QueryOptions): Anime[] {
        return [];
    }

    /**
     * Updates an Anime by MAL ID.
     *
     * Builds an UPDATE statement from the partial entity; executes it and returns the fresh row via findById when rows changed, otherwise null.
     *
     * @param {number} id - The MAL ID.
     * @param {Partial<Anime>} item - Partial fields to update.
     * @returns {Anime | null} Updated Anime or null if no rows changed.
     * @throws {Error} If the Anime cannot produce a valid update SQL.
     */
    update(id: number, item: Partial<Anime>): Anime | null {
        let sqlUpdate = item.toAnimeUpdateSQL();
        if (!sqlUpdate) throw new Error("Invalid Anime object for update");

        const stmt = this.db.prepare(sqlUpdate.sql);
        const result = stmt.run(...sqlUpdate.params);
        if (result.changes === 0) {
            return null;
        }

        return this.findById(id);
    }
}