import {ItemService} from "../types/item-service";
import {Anime} from "../types";
import {QueryOptions} from "../database/types/repository";
import {AnimeRepository} from "../database/repository/anime-repository";
import {deleteCache, getCache, setCache} from "../cache";
import {QueryToString} from "../utils/query-to-string";


/**
 * Service layer for working with Anime entities.
 * Provides caching and orchestrates access to the repository.
 */
export default class AnimeService implements ItemService<Anime> {
    private repository: AnimeRepository;

    /**
     * Constructs the AnimeService with a repository dependency.
     *
     * Stores the provided repository instance on the service for later method calls.
     *
     * @param {AnimeRepository} repository - The underlying data repository.
     */
    constructor(repository: AnimeRepository) {
        this.repository = repository;
    }

    /**
     * Retrieves an Anime by MAL ID, consulting cache first.
     *
     * Checks the cache for the key; if present, returns it; otherwise queries the repository, caches the result, and returns it.
     *
     * @param {number} id - The MAL ID.
     * @returns {Promise<Anime | null>} The Anime if found; otherwise null.
     */
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

    /**
     * Returns all Anime entities.
     *
     * Delegates directly to the repository and wraps the result in a resolved Promise.
     *
     * @returns {Promise<Anime[]>} All Animes; empty if none.
     */
    findAll(): Promise<Anime[]> {
        return Promise.resolve(this.repository.findAll());
    }

    /**
     * Finds Anime by complex query and caches the result.
     *
     * Builds a cache key from the query, returns cached results when available; otherwise fetches from the repository, caches non-empty results, and returns them.
     *
     * @param {QueryOptions} options - Query options.
     * @returns {Promise<Anime[]>} Matching Anime list (possibly empty).
     */
    async findByQuery(options: QueryOptions): Promise<Anime[]> {
        // Check cache first (if implemented)
        // If not in cache, fetch from repository

        let cacheKey = `anime_${QueryToString(options)}`;
        let animeCache = await getCache(cacheKey);
        if (animeCache) {
            return JSON.parse(animeCache) as Anime[]
        }

        let animeList = await this.repository.findByQuery(options);
        if (animeList.length > 0) {
            await setCache(cacheKey, JSON.stringify(animeList));
            return animeList;
        }

        return [];
    }

    /**
     * Creates a new Anime and writes it to cache.
     *
     * Persists the entity via the repository, then caches it keyed by mal_id, and returns the created entity.
     *
     * @param {Anime} item - The Anime to create.
     * @returns {Promise<Anime>} The created Anime.
     */
    async create(item: Anime): Promise<Anime> {
        let createdAnime = await this.repository.create(item);

        // Store in cache for future requests
        await setCache(`anime_${createdAnime.mal_id}`, JSON.stringify(createdAnime));
        return Promise.resolve(createdAnime);
    }

    /**
     * Updates an existing Anime by MAL ID and refreshes cache.
     *
     * Delegates update to the repository; if a row was changed, it overwrites the cache with the updated entity and returns it, otherwise returns null.
     *
     * @param {number} id - The MAL ID.
     * @param {Partial<Anime>} item - Partial update.
     * @returns {Promise<Anime | null>} Updated Anime or null if not found.
     */
    async update(id: number, item: Partial<Anime>): Promise<Anime | null> {
        let updatedAnime = this.repository.update(id, item);
        if (updatedAnime) {
            await setCache(`anime_${id}`, JSON.stringify(updatedAnime));
            return Promise.resolve(updatedAnime);
        }

        return Promise.resolve(null);
    }

    /**
     * Deletes an Anime by MAL ID and removes it from cache.
     *
     * First deletes any cached entry for the MAL ID, then calls the repository to remove the row and returns the outcome.
     *
     * @param {number} id - The MAL ID.
     * @returns {Promise<boolean>} True if deletion succeeded.
     */
    async delete(id: number): Promise<boolean> {
        // Remove from cache
        await deleteCache(`anime_${id}`);
        return Promise.resolve(this.repository.delete(id));
    }
}