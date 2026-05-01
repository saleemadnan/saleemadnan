const test = require('node:test');
const assert = require('node:assert/strict');

const { makeTransport, sanitizeUrl } = require('../transport');
const { CircuitBreaker } = require('../CircuitBreaker');
const { RetryStrategy } = require('../RetryStrategy');

test('transport orchestrates dependencies and succeeds', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
  const breaker = new CircuitBreaker({ windowSize: 3, threshold: 0.5 });
  const failurePolicy = { classify: () => ({ shouldCount: true, retryable: false }) };
  const retry = new RetryStrategy({ maxAttempts: 1, sleep: async () => {}, random: () => 0, failurePolicy });

  const transport = makeTransport({
    fetchImpl: fakeFetch,
    circuitBreaker: breaker,
    retryStrategy: retry,
    failurePolicy,
  });
  const result = await transport.execute({ url: 'https://example.test', requestOptions: { method: 'GET' } });

  assert.equal(result.response.status, 200);
  assert.equal(result.data.ok, true);
  assert.equal(breaker.getState(), 'CLOSED');
});

test('sanitizeUrl redacts access_token from logged URLs', () => {
  const out = sanitizeUrl('https://graph.facebook.com/v19.0/me?access_token=abc123&fields=id');
  assert.match(out, /access_token=%5BREDACTED%5D/);
  assert.doesNotMatch(out, /abc123/);
});
