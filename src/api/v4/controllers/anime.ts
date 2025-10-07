import {Hono} from 'hono'
import {Anime} from "../types";
import '../database/helpers/parser/anime';
import {AnimeRepository} from "../database/repository/anime-repository";
import {getDatabase} from "../database";
import AnimeService from "../services/anime-service";

const app = new Hono()
app.get('/', (c) => c.text('Hello anime!'))
app.get('/:malId', async (c) => {
    let malId = c.req.param('malId') as unknown as number

    try {
        let db = getDatabase();
        const animeRepository = new AnimeRepository(db)
        const animeService = new AnimeService(animeRepository);

        let anime = await animeService.findById(malId);

        if (anime) {
            return c.json({data: anime})
        }

        let response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`).then(res => res.json())
        anime = response.data as Anime
        await animeService.create(anime)
        return c.json(anime)
    } catch (e) {
        console.error(e)
    }

    return c.json({message: 'Anime not found'}, 404)
})

export default app