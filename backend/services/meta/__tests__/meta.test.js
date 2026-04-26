const test = require('node:test');
const assert = require('node:assert/strict');

const { createMetaApiService } = require('../../metaApi');
const { normalizeAdAccountId } = require('../ads');
const { normalizeMetaError, HttpError } = require('../errors');
const { createTokenService, TOKEN_CACHE } = require('../tokens');

test('returns mock data when mock option is enabled', async () => {
  const service = createMetaApiService({ token: 'real-token', mock: true });
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

test('normalizes rate limit code 80004 to HttpError 429', () => {
  const error = normalizeMetaError(400, { code: 80004, message: 'too many calls' });
  assert.ok(error instanceof HttpError);
  assert.equal(error.statusCode, 429);
});

test('token service uses cache to avoid duplicate refresh requests', async () => {
  TOKEN_CACHE.clear();

  let fetchCalls = 0;
  const originalFetch = global.fetch;
  global.fetch = async () => {
    fetchCalls += 1;
    return {
      ok: true,
      json: async () => ({ access_token: 'cached_token', expires_in: 3600 }),
    };
  };

  const client = {
    baseUrl: 'https://graph.facebook.com/v19.0',
    accessToken: 'seed',
    updateToken: () => {},
  };

  const service = createTokenService(client);

  const first = await service.refreshLongLivedToken({
    appId: 'app1',
    appSecret: 'secret1',
    currentToken: 'seed',
  });

  const second = await service.refreshLongLivedToken({
    appId: 'app1',
    appSecret: 'secret1',
    currentToken: 'seed',
  });

  assert.equal(first.access_token, 'cached_token');
  assert.equal(second.access_token, 'cached_token');
  assert.equal(fetchCalls, 1);

  global.fetch = originalFetch;
});
