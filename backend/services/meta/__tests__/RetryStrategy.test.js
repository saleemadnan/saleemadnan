const test = require('node:test');
const assert = require('node:assert/strict');

const { RetryStrategy } = require('../RetryStrategy');

test('RetryStrategy uses exponential backoff with jitter', async () => {
  const delays = [];
  const strategy = new RetryStrategy({
    maxAttempts: 3,
    baseDelayMs: 100,
    jitterRatio: 0.5,
    random: () => 0.5,
    sleep: async (ms) => delays.push(ms),
  });

  let attempts = 0;
  await assert.rejects(async () => {
    await strategy.execute(async () => {
      attempts += 1;
      const error = new Error('retryable');
      error.statusCode = 503;
      throw error;
    });
  });

  assert.equal(attempts, 3);
  assert.deepEqual(delays, [125, 250]);
});

test('RetryStrategy classifies retryable/non-retryable errors', () => {
  const strategy = new RetryStrategy({ maxAttempts: 2, sleep: async () => {} });

  assert.equal(strategy.isRetryable({ statusCode: 429 }), true);
  assert.equal(strategy.isRetryable({ statusCode: 503 }), true);
  assert.equal(strategy.isRetryable({ statusCode: 401 }), false);
  assert.equal(strategy.isRetryable({ statusCode: 403 }), false);
  assert.equal(strategy.isRetryable({ statusCode: 400 }), false);
  assert.equal(strategy.isRetryable({ statusCode: 500 }), true);
});
