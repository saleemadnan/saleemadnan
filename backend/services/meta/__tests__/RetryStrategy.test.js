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
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  let attempts = 0;
  await assert.rejects(async () => {
    await strategy.execute(async () => {
      attempts += 1;
      throw new Error('retryable');
    });
  });

  assert.equal(attempts, 3);
  assert.deepEqual(delays, [125, 250]);
});

test('RetryStrategy uses failurePolicy.classify to decide retries', async () => {
  const strategy = new RetryStrategy({
    maxAttempts: 3,
    sleep: async () => {},
    failurePolicy: { classify: (error) => ({ retryable: error.message !== 'stop' }) },
  });

  let attempts = 0;
  await assert.rejects(async () => {
    await strategy.execute(async () => {
      attempts += 1;
      const error = new Error(attempts === 1 ? 'go' : 'stop');
      throw error;
    });
  });

  assert.equal(attempts, 2);
});
