# jikan-lite

 CLI and API for syncing Jikan v4 data into a local SQLite database using Bun.

## Development

- Start API server: `bun run dev`

## CLI (v4)

Sync anime data from Jikan v4 to the local DB using MAL IDs from the cache list.

Scripts:
- Run CLI: `bun run cli`
- Sync anime: `bun run sync:anime`

Examples:
- `bun run src/cli sync:anime` (all IDs)
- `bun run src/cli sync:anime --limit 100` (first 100 IDs)
- `bun run src/cli sync:anime --from-index 500 --limit 200` (IDs 500..699)
- `bun run src/cli sync:anime --force-update` (update even if already exists)
- `bun run src/cli sync:anime --resume` (resume from last processed index)

Notes:
- The CLI enforces a 1-second delay between each ID to respect rate limits.
- Configure DB filename via `DB_FILENAME` env (defaults to `database.sqlite`).
- Optionally configure cache store via `CACHE_STORE` ("memory" or "redis").

