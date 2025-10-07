# Fastify + Next.js (Single Process) Starter

Variant B — Fastify hosts Next.js in a single Node.js process and single port.

## Stack
- Fastify 4 (API, middleware)
- Next.js 14 (App Router) served via Fastify
- TypeScript, TSX (dev runtime), tsc (prod build)

## Dev
```bash
pnpm i
cp .env.example .env
pnpm dev
# open http://localhost:3000
```

## Build & Run (prod)
```bash
pnpm build
pnpm start
```

## Project Structure
```
app/
  src/
    routes/           # Fastify API routes
    server/           # Fastify + Next integration
web/
  app/                # Next.js (App Router)
```

## Notes
- API endpoints mounted under `/api/*` are served by Fastify *before* handing off to Next.
- All other routes fall through to Next's request handler.
