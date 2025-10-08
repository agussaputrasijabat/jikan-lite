import {Hono} from "hono";
import {logger} from 'hono/logger'
import animeV4 from "./api/v4/controllers/anime"
import mangaV4 from "./api/v4/controllers/manga"
import {Schema} from "./api/v4/database/schema";

const app = new Hono()

const schema = new Schema()
schema.bootstrap()

/**
 * Formats and prints log messages for Hono requests in a compact format.
 * Suppresses inbound logs ("<--") and trims outbound prefix ("-->").
 * Includes an ISO timestamp (yyyy-MM-dd HH:mm:ss).
 *
 * Filters incoming log lines, normalizes the message, prefixes with a timestamp, and forwards to console.log.
 *
 * @param {string} message - The primary log line from hono/logger.
 * @param {...string} rest - Additional arguments to log.
 */
export const customLogger = (message: string, ...rest: string[]) => {
    if (message.startsWith("<--")) return

    if (message.startsWith("-->")) {
        message = message.replace("-->", "").trimStart()
    }

    // Date format: yyyy-MM-dd HH:mm:ss
    console.log(`[${new Date().toISOString().replace("T", " ").substring(0, 19)}] ${message}`, ...rest)
}

app.use(logger(customLogger))

/**
 * Root endpoint providing API metadata and helpful links.
 *
 * Constructs a JSON payload with basic info and returns it using the context’s JSON helper.
 *
 * @route GET /
 * @returns {Promise<Response>} JSON containing welcome message, version, and endpoints.
 */
app.get('/', (c) => {
    return c.json({
        message: 'Welcome to the Jikan Lite API!',
        version: 'v4',
        endpoints: {
            anime: '/v4/anime',
            manga: '/v4/manga'
        },
        documentation: 'Generate locally with `bun run docs` (see README). Output in /docs',
        author: 'Agus Saputra Sijabat',
        database: process.env.DB_CLIENT,
    })
})

// API v4
app.route('/v4/anime', animeV4)
app.route('/v4/manga', mangaV4)

/**
 * Global error handler for the Hono app.
 *
 * Logs the error to stderr and returns a 500 response with a generic message.
 *
 * @param {Error} err - The thrown error.
 * @param {Hono.Context} c - The request context.
 * @returns {Response} A 500 Internal Server Error response.
 */
app.onError((err, c) => {
    console.error('Error:', err)
    return c.text('Internal Server Error', 500)
})

export default app