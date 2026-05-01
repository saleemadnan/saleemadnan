const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { setupRoutes } = require('./routesSetup');

function makeRouter(path, payload) {
  const router = express.Router();
  router.get(path, (req, res) => res.json(payload));
  return router;
}

test('setupRoutes registers pages/instagram/campaigns/messaging routes', async () => {
  const app = express();

  setupRoutes(app, {
    createCampaignsRouter: () => makeRouter('/api/campaigns-test', { campaigns: true }),
    createMessagingRouter: () => makeRouter('/api/messages-test', { messaging: true }),
    createPagesRouter: () => makeRouter('/api/pages-test', { pages: true }),
    createInstagramRouter: () => makeRouter('/api/instagram-test', { instagram: true }),
    metaApiService: {},
  });

  const c = await request(app).get('/api/campaigns-test');
  const m = await request(app).get('/api/messages-test');
  const p = await request(app).get('/api/pages-test');
  const i = await request(app).get('/api/instagram-test');

  assert.equal(c.status, 200);
  assert.equal(m.status, 200);
  assert.equal(p.status, 200);
  assert.equal(i.status, 200);
});
