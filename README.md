# Abu Ghazaleh Restaurant Management System

## Hairiest file review: dashboard front-end
The dashboard was previously concentrated in one large HTML file. It is now split into layers to isolate functionality and improve testability.

### Current split
- `restaurant-manager/index.html`: semantic shell + mount points.
- `restaurant-manager/styles.css`: visual styles only.
- `restaurant-manager/js/data/*.js`: domain data by area (KPIs, alerts, audience, campaigns, content, action plan).
- `restaurant-manager/js/render/*.js`: pure renderers for each dashboard area.
- `restaurant-manager/js/controllers/tabs-controller.js`: tab interaction only.
- `restaurant-manager/js/render/dashboard-mount.js`: composition/wiring of renderers to DOM.
- `restaurant-manager/js/main.js`: bootstrapping.

### Better isolation ideas (next)
- Add a `data-schema.js` validator for each data module to fail fast on malformed input.
- Add `services/metrics-adapter.js` so Meta API payloads are transformed once before rendering.
- Move repeated UI fragments (stat card, percentage bar) into shared render helpers.

### Testing strategy
- **Unit**: continue testing renderers as pure string functions (`tests/dashboard-render.test.mjs`).
- **DOM integration**: add JSDOM tests for `mountDashboard` and tab switching state transitions.
- **E2E**: add Playwright smoke tests for RTL layout, tab navigation, and campaign table rendering.
