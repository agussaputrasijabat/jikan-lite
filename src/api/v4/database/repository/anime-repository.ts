import {Database} from "bun:sqlite";
import {QueryOptions, Repository} from "../types/repository";
import {Anime} from "../../types";
import "../helpers/parser/anime"

export class AnimeRepository implements Repository<Anime> {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    findById(id: number): Anime | null {
        const stmt = this.db.prepare("SELECT * FROM anime WHERE mal_id = ?");
        const anime = stmt.get(id);

        if (!anime) return null;

        return anime.toAnime();
    }

    create(item: Anime): Anime {
        let sqlInsert = item.toAnimeInsertSQL();
        if (!sqlInsert) throw new Error("Invalid Anime object");

        const stmt = this.db.prepare(sqlInsert.sql);
        stmt.run(...sqlInsert.params);
        return item;
    }

    delete(id: number): boolean {
        const stmt = this.db.prepare("DELETE FROM anime WHERE mal_id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    findAll(): Anime[] {
        const stmt = this.db.prepare("SELECT * FROM anime");
        const animeList = stmt.all();
        if (animeList.length === 0) {
            return [];
        }

        return animeList.map((anime) => anime!!.toAnime());
    }

    findByQuery(options: QueryOptions): Anime[] {
        return [];
    }

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