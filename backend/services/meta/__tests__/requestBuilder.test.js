const test = require('node:test');
const assert = require('node:assert/strict');

const { buildRequest } = require('../requestBuilder');

test('buildRequest builds URL with params and access token', () => {
  const { url, requestOptions } = buildRequest({
    baseUrl: 'https://graph.facebook.com/v19.0',
    accessToken: 'token_123',
    endpoint: '/me/accounts',
    method: 'GET',
    params: { fields: 'id,name', limit: 10 },
  });

  assert.equal(url.toString(), 'https://graph.facebook.com/v19.0/me/accounts?fields=id%2Cname&limit=10&access_token=token_123');
  assert.equal(requestOptions.method, 'GET');
  assert.equal(requestOptions.body, undefined);
});

test('buildRequest serializes JSON body for non-GET requests', () => {
  const { requestOptions } = buildRequest({
    baseUrl: 'https://graph.facebook.com/v19.0',
    accessToken: 'token_123',
    endpoint: '/123/feed',
    method: 'POST',
    data: { message: 'hello' },
  });

  assert.equal(requestOptions.headers['Content-Type'], 'application/json');
  assert.equal(requestOptions.body, JSON.stringify({ message: 'hello' }));
});
