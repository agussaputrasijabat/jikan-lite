import {Genre} from "./genre";
import {Producer} from "./producer";
import {Studio} from "./studio";
import {Licensor} from "./licensor";

export type Anime = {
    mal_id: number
    url: string
    images: {
        jpg: {
            image_url: string
            small_image_url: string
            large_image_url: string
        }
        webp: {
            image_url: string
            small_image_url: string
            large_image_url: string
        }
    }
    trailer: {
        youtube_id: string
        url: string
        embed_url: string
        images: {
            image_url: string
            small_image_url: string
            medium_image_url: string
            large_image_url: string
            maximum_image_url: string
        }
    }
    approved: boolean
    titles: [{
        type: string
        title: string
    }]
    title: string
    title_english: string
    title_japanese: string
    title_synonyms: [string]
    type: string
    source: string
    episodes: any
    status: string
    airing: boolean
    aired: {
        from: string
        to: any
        prop: {
            from: {
                day: number
                month: number
                year: number
            }
            to: {
                day: any
                month: any
                year: any
            }
        }
        string: string
    }
    duration: string
    rating: string
    score: number
    scored_by: number
    rank: number
    popularity: number
    members: number
    favorites: number
    synopsis: string
    background: string
    season: string
    year: number
    broadcast: {
        day: string
        time: string
        timezone: string
        string: string
    }
    producers: Producer[]
    licensors: Licensor[]
    studios: Studio[]
    genres?: Genre[]
    explicit_genres: [any]
    themes: [any]
    demographics: [
        {
            mal_id: number
            type: string
            name: string
            url: string
        }
    ]
}
