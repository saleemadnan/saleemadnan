const test = require('node:test');
const assert = require('node:assert/strict');

const { createMetaApiService } = require('../../metaApi');
const { normalizeAdAccountId } = require('../ads');
const { normalizeMetaError } = require('../errors');

test('returns mock data when META_ACCESS_TOKEN is missing', async () => {
  const service = createMetaApiService({ accessToken: '' });
  const result = await service.getPages();

  assert.equal(result.mock, true);
  assert.equal(result.configured, false);
});

test('normalizes ad account id with act_ prefix', () => {
  assert.equal(normalizeAdAccountId('123'), 'act_123');
  assert.equal(normalizeAdAccountId('act_456'), 'act_456');
});

test('normalizes token expiry errors', () => {
  const error = normalizeMetaError(400, { code: 190, error_subcode: 463, message: 'expired' });
  assert.equal(error.statusCode, 401);
  assert.match(error.message, /expired or invalid/i);
});
