# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The `saleemadnan/saleemadnan` repo doubles as the GitHub **profile README** and the
home of the **Abu Ghazaleh Restaurant Management System**. It has three independent
parts plus a thin root orchestrator:

- `backend/` — a Node/Express service that wraps the **Meta Graph API** (Facebook
  Pages, Instagram, Ads, Messaging) with a hand-rolled resilience layer. The only
  part with real depth.
- `restaurant-manager/` — a static, dependency-free dashboard (`index.html` + ES
  modules under `js/`) with a renderer split into `data/` and `render/`.
- `frontend/` — a minimal static client (`index.html`, `js/api.js`).
- root `package.json` — orchestrates the test runs across `backend` and
  `restaurant-manager`; it is not an app itself.

There is no bundler/framework: the frontends are plain HTML + native ES modules, the
backend is CommonJS. Node ≥ 20.

## Commands

```bash
# From repo root — runs backend tests + the dashboard smoke test
npm test

# Backend only (Node's built-in test runner; from repo root)
npm run test:backend
# ...or from backend/ directly:
cd backend && npm test
node --test services/meta/__tests__/transport.test.js   # a single test file

# Dashboard renderer smoke test
node --test restaurant-manager/tests/dashboard-render.test.mjs

# Run the backend server
cd backend && npm run dev      # node server.js

# Production-dependency audit (matches CI)
npm run audit:backend          # npm --prefix backend audit --omit=dev --audit-level=high
```

CI (`.github/workflows/ci.yml`) runs three jobs on Node 20: backend tests +
high-severity prod audit, the dashboard smoke test, and a **secret-hygiene** check
that fails the build if any runtime `.env` file is committed (only `.env.example` is
allowed).

## Backend architecture (`backend/`)

Composition-root style with dependency injection so everything is testable without a
live token.

- `server.js` → `createApp(service, options)` wires Express. Bootstrap is split into
  `bootstrap/`: `routesSetup` (rate limiting + router mounting + error middleware),
  `observabilitySetup`, and `lifecycleSetup` (server create + graceful shutdown).
- `routes/` — one router factory per Meta surface (`campaigns`, `messaging`, `pages`,
  `instagram`), each taking the Meta service injected. Shared helpers
  (`asyncHandler`, `requireFields`, request-id + metrics + error middleware) live in
  `routes/_shared.js`.
- `services/meta/` — the Meta client, assembled in `index.js` via
  `createMetaApiService(config)`, which composes per-domain services (`pages`,
  `instagram`, `ads`, `messaging`, `tokens`) over a single `MetaClient`.
  `services/metaApi.js` is the thin app-facing wrapper exporting a default
  `metaApiService` singleton.

### The resilience layer (the part to understand before changing `services/meta/`)

`MetaClient.request` → `transport.execute` chains, in this order:
**CircuitBreaker** (`assertCanRequest`) → **RetryStrategy** (driven by
`FailurePolicy`, which decides what's retryable) → `fetch` with an `AbortController`
timeout. Errors are normalized through `TransportErrorFactory` / `errorTranslator` /
`errors.js`, and `Logger` + `Metrics` (counters/gauges/histograms) instrument every
call. URLs are sanitized so `access_token` is `[REDACTED]` in logs.

### Mock mode (important)

When `META_ACCESS_TOKEN` is absent (or `forceMock` is set), the client short-circuits
to `mocks.js` and returns canned responses instead of hitting Graph. This is why the
whole suite runs in CI with no secrets — keep new code mock-aware. The required env
keys are listed in `server.js` (`requiredEnvKeys`); `/api/health` reports which are set
and whether the token is `connected`. Setup details (token scopes, long-lived token
exchange) are in `docs/SETUP.md` (Arabic).

## Dashboard (`restaurant-manager/`)

`js/main.js` mounts the dashboard via `render/dashboard-mount.js`, which pulls static
content from `js/data/*` and renders through `js/render/*` (kpi, alerts, campaigns,
audience, content, action-plan). `js/utils/html.js` provides escaping helpers. The
smoke test asserts the renderers produce expected markup — run it after any render/data
change.
