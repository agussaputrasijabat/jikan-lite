import {Database} from "bun:sqlite";
     import {QueryOptions, Repository} from "../types/repository";
     import {Anime} from "../../types";
     import "../helpers/parser/anime"
     import {CountQueryToSQL, QueryToSQL} from "../helpers/query-to-sql";

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
          * Counts the number of records in the database that match the given query options.
          *
          * @param {QueryOptions} options - The options object specifying the criteria for counting records.
          * @return {Promise<number>} The total count of records matching the query.
          */
         async countByQuery(options: QueryOptions): Promise<number> {
             let query = await CountQueryToSQL(options, "anime");
             const stmt = this.db.prepare(query.sql);
             const result: any = stmt.get(...query.params);
             return result.count as number;
         }

         /**
          * Counts all entries in the "anime" table of the database.
          *
          * @return {Promise<number>} The total number of entries in the "anime" table.
          */
         countAll(): Promise<number> {
             const stmt = this.db.prepare("SELECT COUNT(*) as count FROM anime");
             const result: any = stmt.get();
             return Promise.resolve(result.count as number);
         }

         /**
          * Finds a single Anime by MAL ID.
          *
          * Prepares and executes a SELECT query by mal_id; maps the row to an Anime via toAnime(); returns null if not found.
          *
          * @param {number} id - The MAL ID.
          * @returns {Promise<Anime | null>} The Anime if found, otherwise null.
          */
         findById(id: number): Promise<Anime | null> {
             const stmt = this.db.prepare("SELECT * FROM anime WHERE mal_id = ?");
             const anime = stmt.get(id);

             if (!anime) return Promise.resolve(null);

             return Promise.resolve(anime!!.toAnime());
         }

         /**
          * Inserts a new Anime row.
          *
          * Builds an INSERT statement from the Anime instance, runs it against the DB, and returns the original entity.
          *
          * @param {Anime} item - The Anime entity to persist.
          * @returns {Promise<Anime>} The same Anime instance.
          * @throws {Error} If the Anime cannot produce a valid insert SQL.
          */
         create(item: Anime): Promise<Anime> {
             let sqlInsert = item.toAnimeInsertSQL();
             if (!sqlInsert) throw new Error("Invalid Anime object");

             const stmt = this.db.prepare(sqlInsert.sql);
             stmt.run(...sqlInsert.params);
             return Promise.resolve(item);
         }

         /**
          * Deletes an Anime by MAL ID.
          *
          * Executes a DELETE statement by mal_id and returns whether any row was affected.
          *
          * @param {number} id - The MAL ID.
          * @returns {Promise<boolean>} True if a row was removed.
          */
         delete(id: number): Promise<boolean> {
             const stmt = this.db.prepare("DELETE FROM anime WHERE mal_id = ?");
             const result = stmt.run(id);
             return Promise.resolve(result.changes > 0);
         }

         /**
          * Retrieves all Anime rows.
          *
          * Runs a SELECT * query; converts each row with toAnime(); returns an empty array when no rows exist.
          *
          * @returns {Promise<Anime[]>} Array of Anime entities; empty if none.
          */
         findAll(): Promise<Anime[]> {
             const stmt = this.db.prepare("SELECT * FROM anime");
             const animeList = stmt.all();
             if (animeList.length === 0) {
                 return Promise.resolve([]);
             }

             return Promise.resolve(animeList.map((anime: any) => anime!!.toAnime()));
         }

         /**
          * Searches for and retrieves a list of anime based on the provided query options.
          *
          * @param {QueryOptions} options - The query options for filtering anime results.
          * @return {Promise<Anime[]>} An array of anime objects matching the query. Returns an empty array if no matches are found.
          */
         async findByQuery(options: QueryOptions): Promise<Anime[]> {
             let query = await QueryToSQL(options, "anime");
             // console.log(query.sql, query.params);
             const stmt = this.db.prepare(query.sql);
             const result: any = stmt.all(...query.params);

             let rawSql = query.sql;
             for (let param of query.params) {
                    rawSql = rawSql.replace("?", typeof param === "string" ? `'${param}'` : param);
             }

             console.log(rawSql);

             if (result.count === 0) {
                 return [];
             }

             return result.map((anime: any) => anime!!.toAnime());
         }

         /**
          * Updates an Anime by MAL ID.
          *
          * Builds an UPDATE statement from the partial entity; executes it and returns the fresh row via findById when rows changed, otherwise null.
          *
          * @param {number} id - The MAL ID.
          * @param {Partial<Anime>} item - Partial fields to update.
          * @returns {Promise<Anime | null>} Updated Anime or null if no rows changed.
          * @throws {Error} If the Anime cannot produce a valid update SQL.
          */
         update(id: number, item: Partial<Anime>): Promise<Anime | null> {
             let sqlUpdate = item.toAnimeUpdateSQL();
             if (!sqlUpdate) throw new Error("Invalid Anime object for update");

             const stmt = this.db.prepare(sqlUpdate.sql);
             const result = stmt.run(...sqlUpdate.params);
             if (result.changes === 0) {
                 return Promise.resolve(null);
             }

             return Promise.resolve(this.findById(id));
         }
     }