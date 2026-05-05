<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

# BuiltByMaily — Email Template Builder SDK

## Project Structure

```
/
├── apps/
│   ├── demo-app/              # Angular demo (public-facing, no auth)
│   └── builder-standalone/    # Standalone iframe build (postMessage API)
├── libs/
│   └── email-builder/         # Publishable Angular library (@builtbymaily/email-builder)
│       └── src/lib/
│           ├── schema/        # block.types.ts, block.defaults.ts, builder-config.types.ts
│           ├── services/      # template.service.ts, history.service.ts, api.service.ts
│           └── components/    # canvas/, block-editor/, toolbar/, preview/
├── api/                       # Fastify 4 backend (Node 20, ESM)
│   └── src/
│       ├── db/                # Drizzle ORM schema + client
│       ├── middleware/        # api-key.ts (X-API-Key validation)
│       └── routes/            # auth, templates, export, api-keys, assets
└── CLAUDE.md
```

## Key commands

```bash
# Serve the demo app (Angular)
npm run serve:demo          # → http://localhost:4200

# Serve the API (requires api/.env)
npm run serve:api           # → http://localhost:3000

# Build the publishable library
npm run build:lib

# API database migrations
cd api && npm run db:generate   # generate Drizzle migrations
cd api && npm run db:migrate    # apply migrations
cd api && npm run db:studio     # open Drizzle Studio
```

## Architecture rules

- **Block schema** (`libs/email-builder/src/lib/schema/block.types.ts`) is the single source of truth — canvas renders from it, API validates against it, MJML export reads from it.
- **No NgRx** — state is held in `TemplateService` via Angular Signals + `HistoryService` for undo/redo.
- **No MJML in the SDK** — MJML runs server-side only in `api/src/routes/export.ts`.
- **No any** — use `unknown` and narrow.
- **IDs**: always `nanoid(10)`, never UUID.
- **API auth**: SDK uses `X-API-Key` header; dashboard uses JWT Bearer.
- **Asset uploads**: always presigned direct-to-R2, never proxied through the API.

## Current build phase: Phase 1–5 complete

- [x] Phase 1 — Nx monorepo scaffold + Angular library skeleton
- [x] Phase 2 — Block schema + canvas + DnD (CDK)
- [x] Phase 3 — Block editor panel (all 6 block types)
- [x] Phase 4 — Undo/redo (HistoryService + TemplateService)
- [x] Phase 5 — MJML export engine (api/src/routes/export.ts) + iframe standalone
- [ ] Phase 6 — Full Fastify API (DB live, API keys working)
- [ ] Phase 7 — SDK API client replaces localStorage
- [ ] Phase 8 — Asset uploads (R2 presigned URLs)
- [ ] Phase 9 — ng-packagr build + npm publish pipeline