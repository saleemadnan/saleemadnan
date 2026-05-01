const test = require('node:test');
const assert = require('node:assert/strict');

const { FailurePolicy } = require('../FailurePolicy');

const policy = new FailurePolicy();

test('classifies network errors (ECONNREFUSED, ETIMEDOUT, fetch failed)', () => {
  const e1 = policy.classify({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' });
  const e2 = policy.classify({ code: 'ETIMEDOUT', message: 'request timed out' });
  const e3 = policy.classify({ message: 'fetch failed' });

  assert.deepEqual(e1, { source: 'network', shouldCount: true, retryable: true });
  assert.deepEqual(e2, { source: 'network', shouldCount: true, retryable: true });
  assert.deepEqual(e3, { source: 'network', shouldCount: true, retryable: true });
});

test('classifies Meta API errors (80004, 190, 200, 400) with shouldCount decisions', () => {
  const rateLimit = policy.classify({ statusCode: 429, data: { error: { code: 80004 } } });
  const tokenExpired = policy.classify({ statusCode: 401, data: { error: { code: 190 } } });
  const permission = policy.classify({ statusCode: 403, data: { error: { code: 200 } } });
  const badRequest = policy.classify({ statusCode: 400, data: { error: { code: 100 } } });

  assert.deepEqual(rateLimit, { source: 'api', shouldCount: true, retryable: true });
  assert.deepEqual(tokenExpired, { source: 'api', shouldCount: false, retryable: false });
  assert.deepEqual(permission, { source: 'api', shouldCount: false, retryable: false });
  assert.deepEqual(badRequest, { source: 'api', shouldCount: false, retryable: false });
});
