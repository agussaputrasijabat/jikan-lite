import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello manga!'))

app.get('/:malId', async (c) => {
    let malId = c.req.param('malId')
    let response = await fetch(`https://api.jikan.moe/v4/manga/${malId}`).then(res => res.json())
    return c.json(response)
})

export default app