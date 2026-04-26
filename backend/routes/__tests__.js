const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const { createCampaignsRouter } = require('./campaigns');
const { createMessagingRouter } = require('./messaging');
const { errorMiddleware } = require('./_shared');
const { createApp } = require('../server');

function buildApp(router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(errorMiddleware);
  return app;
}

test('POST /api/campaigns validates required fields', async () => {
  const service = { createCampaign: async () => ({ id: 'cmp_1' }) };
  const app = buildApp(createCampaignsRouter(service));

  const response = await request(app).post('/api/campaigns').send({ name: 'Only Name' });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Missing required fields/i);
});

test('POST /api/messages/reply validates required fields', async () => {
  const service = { sendMessage: async () => ({ success: true }) };
  const app = buildApp(createMessagingRouter(service));

  const response = await request(app).post('/api/messages/reply').send({ recipientId: '123' });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Missing required fields/i);
});

test('campaigns router forwards service response on valid input', async () => {
  const service = {
    createCampaign: async (accountId, payload) => ({ accountId, payload, id: 'cmp_123' }),
  };
  const app = buildApp(createCampaignsRouter(service));

  const response = await request(app)
    .post('/api/campaigns')
    .send({
      adAccountId: 'act_42',
      name: 'Spring Sale',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      daily_budget: 1000,
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 'cmp_123');
  assert.equal(response.body.accountId, 'act_42');
  assert.equal(response.body.payload.name, 'Spring Sale');
});

test('POST /api/auth/refresh-token returns 401 when x-internal-api-key is missing/invalid', async () => {
  process.env.INTERNAL_API_KEY = 'expected-key';

  const app = createApp({
    refreshLongLivedToken: async () => ({ access_token: 'new_token' }),
  });

  const response = await request(app)
    .post('/api/auth/refresh-token')
    .send({ currentToken: 'abc' });

  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Unauthorized');
});

test('errorMiddleware returns 500 for unexpected errors without statusCode', async () => {
  const app = express();
  app.get('/boom', (req, res, next) => next(new Error('boom')));
  app.use(errorMiddleware);

  const response = await request(app).get('/boom');
  assert.equal(response.status, 500);
  assert.equal(response.body.error, 'boom');
});
