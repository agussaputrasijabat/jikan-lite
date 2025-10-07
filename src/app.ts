import {Hono} from "hono";
import {logger} from 'hono/logger'
import animeV4 from "./api/v4/controllers/anime"
import mangaV4 from "./api/v4/controllers/manga"
import {Schema} from "./api/v4/database/schema";

const app = new Hono()

const schema = new Schema()
schema.bootstrap()

export const customLogger = (message: string, ...rest: string[]) => {
    if (message.startsWith("<--")) return

    if (message.startsWith("-->")) {
        message = message.replace("-->", "").trimStart()
    }

    // Date format: yyyy-MM-dd HH:mm:ss
    console.log(`[${new Date().toISOString().replace("T", " ").substring(0, 19)}] ${message}`, ...rest)
}

app.use(logger(customLogger))

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