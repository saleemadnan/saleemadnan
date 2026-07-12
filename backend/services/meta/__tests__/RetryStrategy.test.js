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

test('RetryStrategy caps backoff delay at maxDelayMs', async () => {
  const delays = [];
  const strategy = new RetryStrategy({
    maxAttempts: 4,
    baseDelayMs: 100,
    maxDelayMs: 250,
    jitterRatio: 0.5,
    random: () => 0.5,
    sleep: async (ms) => delays.push(ms),
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  await assert.rejects(async () => {
    await strategy.execute(async () => {
      throw new Error('retryable');
    });
  });

  assert.deepEqual(delays, [125, 250, 250]);
});

function retryableErrorWithHeader(retryAfter) {
  const error = new Error('rate limited');
  error.response = {
    headers: {
      get: (name) => (name === 'retry-after' ? retryAfter : null),
    },
  };
  return error;
}

test('RetryStrategy honors numeric Retry-After header in seconds', async () => {
  const delays = [];
  const strategy = new RetryStrategy({
    maxAttempts: 2,
    baseDelayMs: 100,
    sleep: async (ms) => delays.push(ms),
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  await assert.rejects(async () => {
    await strategy.execute(async () => {
      throw retryableErrorWithHeader('3');
    });
  });

  assert.deepEqual(delays, [3000]);
});

test('RetryStrategy honors HTTP-date Retry-After header', async () => {
  const delays = [];
  const nowMs = Date.parse('2026-07-12T10:00:00Z');
  const strategy = new RetryStrategy({
    maxAttempts: 2,
    baseDelayMs: 100,
    now: () => nowMs,
    sleep: async (ms) => delays.push(ms),
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  await assert.rejects(async () => {
    await strategy.execute(async () => {
      throw retryableErrorWithHeader('Sun, 12 Jul 2026 10:00:05 GMT');
    });
  });

  assert.deepEqual(delays, [5000]);
});

test('RetryStrategy caps Retry-After delay at maxDelayMs', async () => {
  const delays = [];
  const strategy = new RetryStrategy({
    maxAttempts: 2,
    maxDelayMs: 2000,
    sleep: async (ms) => delays.push(ms),
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  await assert.rejects(async () => {
    await strategy.execute(async () => {
      throw retryableErrorWithHeader('60');
    });
  });

  assert.deepEqual(delays, [2000]);
});

test('RetryStrategy falls back to backoff on invalid Retry-After header', async () => {
  const delays = [];
  const strategy = new RetryStrategy({
    maxAttempts: 2,
    baseDelayMs: 100,
    jitterRatio: 0,
    random: () => 0,
    sleep: async (ms) => delays.push(ms),
    failurePolicy: { classify: () => ({ retryable: true }) },
  });

  await assert.rejects(async () => {
    await strategy.execute(async () => {
      throw retryableErrorWithHeader('not-a-date');
    });
  });

  assert.deepEqual(delays, [100]);
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
