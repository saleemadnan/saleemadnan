const test = require('node:test');
const assert = require('node:assert/strict');

const { createTransport } = require('../transport');

test('transport retries on 429 and succeeds within retry window', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    if (calls < 3) {
      return { ok: false, status: 429, json: async () => ({ error: { code: 80004 } }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: 'ok' }) };
  };

  const transport = createTransport({ fetchImpl: fakeFetch });
  const result = await transport.execute({
    url: 'https://example.test',
    requestOptions: { method: 'GET' },
  });

  assert.equal(calls, 3);
  assert.equal(result.response.ok, true);
  assert.equal(result.data.data, 'ok');
});

test('transport opens circuit breaker after high failure rate', async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, json: async () => ({ error: { message: 'x' } }) });
  const transport = createTransport({ fetchImpl: fakeFetch });

  for (let i = 0; i < 10; i += 1) {
    await transport.execute({ url: 'https://example.test', requestOptions: { method: 'GET' } });
  }

  await assert.rejects(
    () => transport.execute({ url: 'https://example.test', requestOptions: { method: 'GET' } }),
    (error) => error.statusCode === 503
  );
});
