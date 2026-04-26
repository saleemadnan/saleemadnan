const test = require('node:test');
const assert = require('node:assert/strict');

const { CircuitBreaker, STATES } = require('../CircuitBreaker');

test('CircuitBreaker transitions CLOSED -> OPEN -> HALF_OPEN -> CLOSED', () => {
  let now = 1_000;
  const breaker = new CircuitBreaker({
    threshold: 0.5,
    windowSize: 4,
    cooldownMs: 30_000,
    now: () => now,
  });

  breaker.onFailure();
  breaker.onFailure();
  breaker.onSuccess();
  breaker.onFailure();

  assert.equal(breaker.getState(), STATES.OPEN);
  assert.equal(breaker.canRequest(), false);

  now += 31_000;
  assert.equal(breaker.getState(), STATES.HALF_OPEN);
  assert.equal(breaker.canRequest(), true);

  breaker.onSuccess();
  assert.equal(breaker.getState(), STATES.CLOSED);
});


test('assertCanRequest throws circuit-open error when OPEN', () => {
  let now = 1000;
  const breaker = new CircuitBreaker({ threshold: 0.5, windowSize: 2, cooldownMs: 30000, now: () => now });

  breaker.onFailure();
  breaker.onFailure();

  assert.throws(() => breaker.assertCanRequest(), (error) => error.statusCode === 503 && /Circuit breaker is open/i.test(error.message));
});
