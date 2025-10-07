import {ItemService} from "../types/item-service";
import {Anime} from "../types";
import {QueryOptions} from "../database/types/repository";
import {AnimeRepository} from "../database/repository/anime-repository";
import {deleteCache, getCache, setCache} from "../cache";
import {QueryToString} from "../utils/query-to-string";


export default class AnimeService implements ItemService<Anime> {
    private repository: AnimeRepository;

    constructor(repository: AnimeRepository) {
        this.repository = repository;
    }

    async findById(id: number): Promise<Anime | null> {
        // Check cache first (if implemented)
        // If not in cache, fetch from repository

        let animeCache = await getCache(`anime_${id}`);
        if (animeCache) {
            return JSON.parse(animeCache) as Anime;
        }

        let anime = this.repository.findById(id)
        if (anime) {
            // Store in cache for future requests
            await setCache(`anime_${id}`, JSON.stringify(anime));
            return anime;
        }

        return null;
    }

    findAll(): Promise<Anime[]> {
        return Promise.resolve(this.repository.findAll());
    }

    async findByQuery(options: QueryOptions): Promise<Anime[]> {
        // Check cache first (if implemented)
        // If not in cache, fetch from repository

        let cacheKey = `anime_${QueryToString(options)}`;
        let animeCache = await getCache(cacheKey);
        if (animeCache) {
            return JSON.parse(animeCache) as Anime[]
        }

        let animeList = this.repository.findByQuery(options);
        if (animeList.length > 0) {
            await setCache(cacheKey, JSON.stringify(animeList));
            return animeList;
        }

        return [];
    }

    async create(item: Anime): Promise<Anime> {
        let createdAnime = this.repository.create(item);

        // Store in cache for future requests
        await setCache(`anime_${createdAnime.mal_id}`, JSON.stringify(createdAnime));
        return Promise.resolve(createdAnime);
    }

    async update(id: number, item: Partial<Anime>): Promise<Anime | null> {
        let updatedAnime = this.repository.update(id, item);
        if (updatedAnime) {
            await setCache(`anime_${id}`, JSON.stringify(updatedAnime));
            return Promise.resolve(updatedAnime);
        }

        return Promise.resolve(null);
    }

    async delete(id: number): Promise<boolean> {
        // Remove from cache
        await deleteCache(`anime_${id}`);
        return Promise.resolve(this.repository.delete(id));
    }

}