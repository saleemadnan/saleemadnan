const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const { createServer, registerShutdownHandlers } = require('./lifecycleSetup');

test('createServer returns http server', () => {
  const app = express();
  const server = createServer(app);
  assert.equal(typeof server.listen, 'function');
  server.close();
});

test('registerShutdownHandlers handles SIGTERM and closes server', async () => {
  const handlers = {};
  const originalOn = process.on;
  const originalExit = process.exit;

  let closed = false;
  let exitCode = null;

  process.on = (event, handler) => {
    handlers[event] = handler;
    return process;
  };
  process.exit = (code) => {
    exitCode = code;
  };

  const server = {
    close: () => { closed = true; },
    getConnections: (cb) => cb(null, 0),
  };

  registerShutdownHandlers(server, { logger: { info: () => {}, error: () => {} }, timeoutMs: 5 });
  await handlers.SIGTERM();

  assert.equal(closed, true);
  assert.equal(exitCode, 0);

  process.on = originalOn;
  process.exit = originalExit;
});
