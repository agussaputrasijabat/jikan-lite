import app from "./app";

Bun.serve({
    fetch: app.fetch,
    port: process.env.PORT,
    hostname: process.env.HOST,
    reusePort: true,
});

console.log(`Server running at http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`);