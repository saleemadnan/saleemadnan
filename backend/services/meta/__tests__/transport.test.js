const test = require('node:test');
const assert = require('node:assert/strict');

const { makeTransport } = require('../transport');
const { CircuitBreaker } = require('../CircuitBreaker');
const { RetryStrategy } = require('../RetryStrategy');

test('transport orchestrates dependencies and succeeds', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
  const breaker = new CircuitBreaker({ windowSize: 3, threshold: 0.5 });
  const retry = new RetryStrategy({ maxAttempts: 1, sleep: async () => {}, random: () => 0 });

  const transport = makeTransport({ fetchImpl: fakeFetch, circuitBreaker: breaker, retryStrategy: retry });
  const result = await transport.execute({ url: 'https://example.test', requestOptions: { method: 'GET' } });

  assert.equal(result.response.status, 200);
  assert.equal(result.data.ok, true);
  assert.equal(breaker.getState(), 'CLOSED');
});
