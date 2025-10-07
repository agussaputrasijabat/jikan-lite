import {Hono} from "hono";
import animeV4 from "./api/v4/controllers/anime"
import mangaV4 from "./api/v4/controllers/manga"
import {Schema} from "./api/v4/database/schema";

const app = new Hono()

const schema = new Schema()
schema.bootstrap()


app.get('/', (c) => {
    return c.json({
        message: 'Welcome to the Jikan Lite API!',
        version: 'v4',
        endpoints: {
            anime: '/v4/anime',
            manga: '/v4/manga'
        },
        documentation: 'Comming soon...',
        author: 'Agus Saputra Sijabat',
        database: process.env.DB_CLIENT,
    })
})

// API v4
app.route('/v4/anime', animeV4)
app.route('/v4/manga', mangaV4)

app.onError((err, c) => {
    console.error('Error:', err)
    return c.text('Internal Server Error', 500)
})

export default app