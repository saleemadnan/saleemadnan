const test = require('node:test');
const assert = require('node:assert/strict');

const { HealthCheck } = require('../HealthCheck');
const { STATES } = require('../CircuitBreaker');

test('liveness always returns ok', async () => {
  const hc = new HealthCheck({ service: { isConfigured: true } });
  const result = await hc.liveness();

  assert.equal(result.ok, true);
  assert.equal(result.status, 'live');
});

test('readiness fails when circuit breaker is OPEN', async () => {
  const hc = new HealthCheck({
    service: { isConfigured: true },
    circuitBreaker: { getState: () => STATES.OPEN },
  });

  const result = await hc.readiness();
  assert.equal(result.ok, false);
  assert.equal(result.checks.circuitOpen, true);
});
