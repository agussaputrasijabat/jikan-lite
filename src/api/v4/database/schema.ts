import {getDatabase} from "./index";

export class Schema {
    bootstrap() {
        this.createAnimeTable()
    }

    private createAnimeTable() {
        let db = getDatabase()

        let animeSchema = `
            CREATE TABLE IF NOT EXISTS [anime] (
              [mal_id] INT PRIMARY KEY,
              [url] TEXT,
              [images.jpg.image_url] TEXT,
              [images.jpg.small_image_url] TEXT,
              [images.jpg.large_image_url] TEXT,
              [images.webp.image_url] TEXT,
              [images.webp.small_image_url] TEXT,
              [images.webp.large_image_url] TEXT,
              [trailer.youtube_id] TEXT,
              [trailer.url] TEXT,
              [trailer.embed_url] TEXT,
              [trailer.images.image_url] TEXT,
              [trailer.images.small_image_url] TEXT,
              [trailer.images.medium_image_url] TEXT,
              [trailer.images.large_image_url] TEXT,
              [trailer.images.maximum_image_url] TEXT,
              [approved] INT,
              [titles] TEXT,
              [title] TEXT,
              [title_english] TEXT,
              [title_japanese] TEXT,
              [title_synonyms] TEXT,
              [type] TEXT,
              [source] TEXT,
              [episodes] TEXT NULL,
              [status] TEXT,
              [airing] INT,
              [aired.from] TEXT,
              [aired.to] TEXT NULL,
              [aired.prop.from.day] INT,
              [aired.prop.from.month] INT,
              [aired.prop.from.year] INT,
              [aired.prop.to.day] TEXT NULL,
              [aired.prop.to.month] TEXT NULL,
              [aired.prop.to.year] TEXT NULL,
              [aired.string] TEXT,
              [duration] TEXT,
              [rating] TEXT,
              [score] REAL,
              [scored_by] INT,
              [rank] INT,
              [popularity] INT,
              [members] INT,
              [favorites] INT,
              [synopsis] TEXT,
              [background] TEXT,
              [season] TEXT,
              [year] INT,
              [broadcast.day] TEXT,
              [broadcast.time] TEXT,
              [broadcast.timezone] TEXT,
              [broadcast.string] TEXT,
              [producers] TEXT,
              [licensors] TEXT,
              [studios] TEXT,
              [genres] TEXT,
              [explicit_genres] TEXT,
              [themes] TEXT,
              [demographics] TEXT
            );
        `

        db.run(animeSchema)
    }
}