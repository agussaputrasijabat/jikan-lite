import { Hono } from 'hono'

/**
 * Router for Manga endpoints (v4).
 */
const app = new Hono()

/**
 * Health/hello endpoint for manga route.
 *
 * Returns a simple text message to confirm the manga route is active.
 *
 * @route GET /v4/manga/
 * @returns {string} Plain text hello response.
 */
app.get('/', (c) => c.text('Hello manga!'))

/**
 * Retrieves manga by MAL ID from the Jikan API and returns raw response.
 *
 * Extracts malId from the route, calls the upstream Jikan API, and returns the JSON body directly.
 *
 * @route GET /v4/manga/:malId
 * @param {Hono.Context} c - The request context with route param malId.
 * @returns {Promise<Response>} JSON response from upstream API.
 */
app.get('/:malId', async (c) => {
    let malId = c.req.param('malId')
    let response = await fetch(`https://api.jikan.moe/v4/manga/${malId}`).then(res => res.json())
    return c.json(response)
})

export default app