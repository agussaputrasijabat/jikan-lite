import {Anime} from "../../../types";
import {nullableString, parseJSON, parseTitles, toBool, toNullableNumber, toNumber} from "./util";

declare global {
    interface Object {
        /**
         * Converts a plain database row object to a strongly-typed Anime entity.
         * @returns {Anime}
         */
        toAnime(): Anime;

        /**
         * Produces an INSERT SQL statement and parameters for persisting an Anime.
         * @returns {SqlTuple}
         */
        toAnimeInsertSQL(): SqlTuple;

        /**
         * Produces an UPDATE SQL statement (by [mal_id]) and parameters for an Anime.
         * @returns {SqlTuple}
         */
        toAnimeUpdateSQL(): SqlTuple;
    }
}

// non-enumerable to avoid polluting object keys
/**
 * Converts the current object (assumed DB row) into an Anime object by mapping and parsing fields.
 *
 * @this any
 * @returns {Anime} Mapped Anime entity.
 */
Object.defineProperty(Object.prototype, "toAnime", {
    value: function toAnime(this: any): Anime {
        const row: any = this;

        const titles = parseTitles(row["titles"], nullableString(row["title"]) ?? "");

        return {
            mal_id: toNumber(row["mal_id"]),
            url: nullableString(row["url"]) ?? "",
            images: {
                jpg: {
                    image_url: nullableString(row["images.jpg.image_url"]),
                    small_image_url: nullableString(row["images.jpg.small_image_url"]),
                    large_image_url: nullableString(row["images.jpg.large_image_url"]),
                },
                webp: {
                    image_url: nullableString(row["images.webp.image_url"]),
                    small_image_url: nullableString(row["images.webp.small_image_url"]),
                    large_image_url: nullableString(row["images.webp.large_image_url"]),
                },
            },
            trailer: {
                youtube_id: nullableString(row["trailer.youtube_id"]),
                url: nullableString(row["trailer.url"]),
                embed_url: nullableString(row["trailer.embed_url"]),
                images: {
                    image_url: nullableString(row["trailer.images.image_url"]),
                    small_image_url: nullableString(row["trailer.images.small_image_url"]),
                    medium_image_url: nullableString(row["trailer.images.medium_image_url"]),
                    large_image_url: nullableString(row["trailer.images.large_image_url"]),
                    maximum_image_url: nullableString(row["trailer.images.maximum_image_url"]),
                },
            },
            approved: toBool(row["approved"]),
            titles,
            title: nullableString(row["title"]) ?? "",
            title_english: nullableString(row["title_english"]),
            title_japanese: nullableString(row["title_japanese"]),
            title_synonyms: parseJSON<string[]>(row["title_synonyms"], []),
            type: nullableString(row["type"]),
            source: nullableString(row["source"]),
            episodes: toNullableNumber(row["episodes"]),
            status: nullableString(row["status"]),
            airing: toBool(row["airing"]),
            aired: {
                from: nullableString(row["aired.from"]),
                to: nullableString(row["aired.to"]),
                prop: {
                    from: {
                        day: toNullableNumber(row["aired.prop.from.day"]),
                        month: toNullableNumber(row["aired.prop.from.month"]),
                        year: toNullableNumber(row["aired.prop.from.year"]),
                    },
                    to: {
                        day: toNullableNumber(row["aired.prop.to.day"]),
                        month: toNullableNumber(row["aired.prop.to.month"]),
                        year: toNullableNumber(row["aired.prop.to.year"]),
                    },
                },
                string: nullableString(row["aired.string"]),
            },
            duration: nullableString(row["duration"]),
            rating: nullableString(row["rating"]),
            score: toNullableNumber(row["score"]),
            scored_by: toNumber(row["scored_by"]),
            rank: toNullableNumber(row["rank"]),
            popularity: toNumber(row["popularity"]),
            members: toNumber(row["members"]),
            favorites: toNumber(row["favorites"]),
            synopsis: nullableString(row["synopsis"]),
            background: nullableString(row["background"]),
            season: nullableString(row["season"]),
            year: toNullableNumber(row["year"]),
            broadcast: {
                day: nullableString(row["broadcast.day"]),
                time: nullableString(row["broadcast.time"]),
                timezone: nullableString(row["broadcast.timezone"]),
                string: nullableString(row["broadcast.string"]),
            },
            producers: parseJSON(row["producers"], []),
            licensors: parseJSON(row["licensors"], []),
            studios: parseJSON(row["studios"], []),
            genres: parseJSON(row["genres"], []),
            explicit_genres: parseJSON(row["explicit_genres"], []),
            themes: parseJSON(row["themes"], []),
            demographics: parseJSON(row["demographics"], []),
        } as unknown as Anime;
    },
    writable: false,
    configurable: true,
    enumerable: false,
});

/**
 * A small helper tuple containing a SQL statement and its parameter values.
 */
type SqlTuple = { sql: string; params: any[] };

/**
 * JSON-stringifies non-null/undefined values; returns null otherwise.
 * @param {unknown} v - Value to serialize.
 * @returns {string | null}
 */
const j = (v: unknown) => (v === undefined ? null : v === null ? null : JSON.stringify(v));

/**
 * Normalizes a possibly undefined/null string to null.
 * @param {string | null | undefined} v
 * @returns {string | null}
 */
const s = (v?: string | null) => (v ?? null);

/**
 * Normalizes a possibly undefined/null number to null.
 * @param {number | null | undefined} v
 * @returns {number | null}
 */
const n = (v?: number | null) => (v ?? null);

/**
 * Converts a boolean-ish value to 1/0 (SQLite friendly); null/undefined become 0.
 * @param {boolean | null | undefined} v
 * @returns {0 | 1}
 */
const b = (v?: boolean | null) => (v ? 1 : 0);

/**
 * Column names used for building SQL statements for the anime table.
 */
const ANIME_COLUMNS = [
    "[mal_id]",
    "[url]",
    "[images.jpg.image_url]",
    "[images.jpg.small_image_url]",
    "[images.jpg.large_image_url]",
    "[images.webp.image_url]",
    "[images.webp.small_image_url]",
    "[images.webp.large_image_url]",
    "[trailer.youtube_id]",
    "[trailer.url]",
    "[trailer.embed_url]",
    "[trailer.images.image_url]",
    "[trailer.images.small_image_url]",
    "[trailer.images.medium_image_url]",
    "[trailer.images.large_image_url]",
    "[trailer.images.maximum_image_url]",
    "[approved]",
    "[titles]",
    "[title]",
    "[title_english]",
    "[title_japanese]",
    "[title_synonyms]",
    "[type]",
    "[source]",
    "[episodes]",
    "[status]",
    "[airing]",
    "[aired.from]",
    "[aired.to]",
    "[aired.prop.from.day]",
    "[aired.prop.from.month]",
    "[aired.prop.from.year]",
    "[aired.prop.to.day]",
    "[aired.prop.to.month]",
    "[aired.prop.to.year]",
    "[aired.string]",
    "[duration]",
    "[rating]",
    "[score]",
    "[scored_by]",
    "[rank]",
    "[popularity]",
    "[members]",
    "[favorites]",
    "[synopsis]",
    "[background]",
    "[season]",
    "[year]",
    "[broadcast.day]",
    "[broadcast.time]",
    "[broadcast.timezone]",
    "[broadcast.string]",
    "[producers]",
    "[licensors]",
    "[studios]",
    "[genres]",
    "[explicit_genres]",
    "[themes]",
    "[demographics]",
] as const;

/**
 * Produces the parameter values (aligned with ANIME_COLUMNS) for an Anime entity.
 * @param {Anime} a - The Anime entity.
 * @returns {any[]} Ordered values to be used with prepared SQL statements.
 */
function animeValues(a: Anime): any[] {
    return [
        n(a.mal_id),
        s(a.url),
        s(a.images?.jpg?.image_url),
        s(a.images?.jpg?.small_image_url),
        s(a.images?.jpg?.large_image_url),
        s(a.images?.webp?.image_url),
        s(a.images?.webp?.small_image_url),
        s(a.images?.webp?.large_image_url),
        s(a.trailer?.youtube_id),
        s(a.trailer?.url),
        s(a.trailer?.embed_url),
        s(a.trailer?.images?.image_url),
        s(a.trailer?.images?.small_image_url),
        s(a.trailer?.images?.medium_image_url),
        s(a.trailer?.images?.large_image_url),
        s(a.trailer?.images?.maximum_image_url),
        b(a.approved),
        j(a.titles ?? []),
        s(a.title),
        s(a.title_english),
        s(a.title_japanese),
        j(a.title_synonyms ?? []),
        s(a.type),
        s(a.source),
        a.episodes ?? null,
        s(a.status),
        b(a.airing),
        s(a.aired?.from),
        s(a.aired?.to),
        n(a.aired?.prop?.from?.day ?? null),
        n(a.aired?.prop?.from?.month ?? null),
        n(a.aired?.prop?.from?.year ?? null),
        n(a.aired?.prop?.to?.day ?? null),
        n(a.aired?.prop?.to?.month ?? null),
        n(a.aired?.prop?.to?.year ?? null),
        s(a.aired?.string),
        s(a.duration),
        s(a.rating),
        a.score ?? null,
        n(a.scored_by),
        a.rank ?? null,
        n(a.popularity),
        n(a.members),
        n(a.favorites),
        s(a.synopsis),
        s(a.background),
        s(a.season),
        a.year ?? null,
        s(a.broadcast?.day),
        s(a.broadcast?.time),
        s(a.broadcast?.timezone),
        s(a.broadcast?.string),
        j(a.producers ?? []),
        j(a.licensors ?? []),
        j(a.studios ?? []),
        j(a.genres ?? []),
        j(a.explicit_genres ?? []),
        j(a.themes ?? []),
        j(a.demographics ?? []),
    ];
}

// INSERT builder
/**
 * Builds an INSERT statement and parameters for the current Anime object.
 * @this Anime
 * @returns {SqlTuple} Tuple of SQL and params for INSERT.
 */
Object.defineProperty(Object.prototype, "toAnimeInsertSQL", {
    value: function toAnimeInsertSQL(this: any): SqlTuple {
        const a = this as Anime;
        const cols = ANIME_COLUMNS.join(", ");
        const placeholders = ANIME_COLUMNS.map(() => "?").join(", ");
        const sql = `INSERT INTO [anime] (${cols})
                     VALUES (${placeholders});`;
        const params = animeValues(a);
        return {sql, params};
    },
    writable: false,
    configurable: true,
    enumerable: false,
});

// UPDATE builder (by primary key [mal_id])
/**
 * Builds an UPDATE statement (by [mal_id]) and parameters for the current Anime object.
 * @this Anime
 * @returns {SqlTuple} Tuple of SQL and params for UPDATE.
 */
Object.defineProperty(Object.prototype, "toAnimeUpdateSQL", {
    value: function toAnimeUpdateSQL(this: any): SqlTuple {
        const a = this as Anime;
        const allValues = animeValues(a);
        const malIdIdx = ANIME_COLUMNS.indexOf("[mal_id]");
        const setPairs = ANIME_COLUMNS.filter((c) => c !== "[mal_id]").map((c) => `${c} = ?`).join(", ");
        const params = allValues.filter((_, i) => i !== malIdIdx).concat([a.mal_id]);
        const sql = `UPDATE [anime]
                     SET ${setPairs}
                     WHERE [mal_id] = ?;`;
        return {sql, params};
    },
    writable: false,
    configurable: true,
    enumerable: false,
});

// make this a module to apply global augmentation
export {};