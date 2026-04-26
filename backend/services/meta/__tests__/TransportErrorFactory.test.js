const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createNetworkError,
  createTimeoutError,
  createCircuitOpenError,
  createRetryExhaustedError,
  createApiError,
} = require('../TransportErrorFactory');

test('factory functions create errors with expected status codes', () => {
  const networkError = createNetworkError(new Error('ECONNREFUSED'));
  const timeoutError = createTimeoutError(15000);
  const circuitError = createCircuitOpenError();
  const apiError = createApiError(80004, 'Rate limit', { statusCode: 429, data: { error: { code: 80004 } } });

  assert.equal(networkError.statusCode, 503);
  assert.equal(timeoutError.statusCode, 504);
  assert.equal(circuitError.statusCode, 503);
  assert.equal(apiError.statusCode, 429);
});

test('createRetryExhaustedError preserves last error status code', () => {
  const lastError = { statusCode: 429, message: 'Too many requests' };
  const exhausted = createRetryExhaustedError(3, lastError);

  assert.equal(exhausted.statusCode, 429);
  assert.match(exhausted.message, /3 attempts/i);
});

test('factory messages include expected information', () => {
  const timeoutError = createTimeoutError(5000);
  const exhausted = createRetryExhaustedError(2, { statusCode: 503, message: 'Service unavailable' });

  assert.match(timeoutError.message, /5000ms/);
  assert.match(exhausted.message, /Service unavailable/);
  assert.match(exhausted.message, /2 attempts/);
});
