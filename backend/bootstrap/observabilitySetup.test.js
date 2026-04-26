const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { setupObservability } = require('./observabilitySetup');
const { Metrics } = require('../services/meta/Metrics');

test('health live returns 200 and request id appears in response header', async () => {
  process.env.INTERNAL_API_KEY = 'k';

  const app = express();
  setupObservability(app, {
    metrics: new Metrics(),
    healthCheck: {
      liveness: async () => ({ ok: true, status: 'live' }),
      readiness: async () => ({ ok: true, status: 'ready' }),
    },
  });

  const res = await request(app).get('/health/live');
  assert.equal(res.status, 200);
  assert.ok(res.headers['x-request-id']);
});

test('/metrics endpoint is protected', async () => {
  process.env.INTERNAL_API_KEY = 'k';

  const app = express();
  setupObservability(app, {
    metrics: new Metrics(),
    healthCheck: {
      liveness: async () => ({ ok: true, status: 'live' }),
      readiness: async () => ({ ok: true, status: 'ready' }),
    },
  });

  const unauthorized = await request(app).get('/metrics');
  assert.equal(unauthorized.status, 401);

  const authorized = await request(app).get('/metrics').set('x-internal-api-key', 'k');
  assert.equal(authorized.status, 200);
});
