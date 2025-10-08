import {Hono} from 'hono'
import {Anime} from "../types";
import '../database/helpers/parser/anime';
import {AnimeRepository} from "../database/repository/anime-repository";
import {getDatabase} from "../database";
import AnimeService from "../services/anime-service";

/**
 * Router for Anime endpoints (v4).
 */
const app = new Hono()

/**
 * Health/hello endpoint for anime route.
 *
 * Returns a simple text response to verify the route is reachable.
 *
 * @route GET /v4/anime/
 * @returns {string} Plain text hello response.
 */
app.get('/', (c) => c.text('Hello anime!'))

/**
 * Retrieves anime by MAL ID. First checks local DB/cache, otherwise fetches from Jikan API.
 * Sets X-Data-Source header to indicate the data source (cache/api).
 *
 * Parses the malId, queries the service for cached/DB data; if absent, fetches from upstream API, persists and caches it, sets a header indicating the source, and returns JSON.
 *
 * @route GET /v4/anime/:malId
 * @param {Hono.Context} c - The request context with route param malId.
 * @returns {Promise<Response>} JSON response with data or error message.
 */
app.get('/:malId', async (c) => {
    let malId = c.req.param('malId') as unknown as number

    try {
        let db = getDatabase();
        const animeRepository = new AnimeRepository(db)
        const animeService = new AnimeService(animeRepository);

        let anime = await animeService.findById(malId);

        if (anime) {
            // Add header to indicate data is from cache
            c.header('X-Data-Source', 'cache');

            return c.json({data: anime})
        }

        let response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`).then(res => res.json())

        if (response && response.data) {
            anime = response.data as Anime
            await animeService.create(anime)

            // Add header to indicate data is from API
            c.header('X-Data-Source', 'api');

            return c.json({data: anime})
        }

    } catch (e) {
        c.status(500)
        return c.json({error: e})
    }

    return c.json({message: 'Anime not found'}, 404)
})

export default app