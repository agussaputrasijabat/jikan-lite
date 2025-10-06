import {Published} from "./published";
import {Author} from "./author";
import {Title} from "./title";
import {Image} from "./image";

export interface Manga {
    mal_id: number;
    url: string;
    images: { [key: string]: Image };
    approved: boolean;
    titles: Title[];
    title: string;
    title_english: string;
    title_japanese: string;
    title_synonyms: any[];
    type: string;
    chapters: number;
    volumes: number;
    status: string;
    publishing: boolean;
    published: Published;
    score: number;
    scored: number;
    scored_by: number;
    rank: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis: string;
    background: string;
    authors: Author[];
    serializations: Author[];
    genres: Author[];
    explicit_genres: any[];
    themes: Author[];
    demographics: Author[];
}