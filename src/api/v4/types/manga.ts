export type Manga = {
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
    approved: boolean
    titles: Array<{
        type: string
        title: string
    }>
    title: string
    title_english: string
    title_japanese: string
    title_synonyms: Array<any>
    type: string
    chapters: number
    volumes: number
    status: string
    publishing: boolean
    published: {
        from: string
        to: string
        prop: {
            from: {
                day: number
                month: number
                year: number
            }
            to: {
                day: number
                month: number
                year: number
            }
        }
        string: string
    }
    score: number
    scored: number
    scored_by: number
    rank: number
    popularity: number
    members: number
    favorites: number
    synopsis: string
    background: string
    authors: Array<{
        mal_id: number
        type: string
        name: string
        url: string
    }>
    serializations: Array<{
        mal_id: number
        type: string
        name: string
        url: string
    }>
    genres: Array<{
        mal_id: number
        type: string
        name: string
        url: string
    }>
    explicit_genres: Array<any>
    themes: Array<{
        mal_id: number
        type: string
        name: string
        url: string
    }>
    demographics: Array<{
        mal_id: number
        type: string
        name: string
        url: string
    }>
}
