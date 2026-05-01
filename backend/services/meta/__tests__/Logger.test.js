const test = require('node:test');
const assert = require('node:assert/strict');

const { Logger } = require('../Logger');

function createSink() {
  const lines = [];
  return {
    lines,
    log: (line) => lines.push(line),
  };
}

test('Logger outputs JSON format in production', () => {
  const sink = createSink();
  const logger = new Logger({ env: 'production', sink, level: 'debug' });

  logger.info('hello', { a: 1 });

  const parsed = JSON.parse(sink.lines[0]);
  assert.equal(parsed.level, 'info');
  assert.equal(parsed.message, 'hello');
  assert.equal(parsed.context.a, 1);
  assert.ok(parsed.timestamp);
});

test('child logger inherits and extends context', () => {
  const sink = createSink();
  const logger = new Logger({ env: 'production', sink, level: 'debug', context: { requestId: 'r1' } });
  const child = logger.child({ userId: 'u1' });

  child.info('ctx test', { action: 'x' });

  const parsed = JSON.parse(sink.lines[0]);
  assert.equal(parsed.context.requestId, 'r1');
  assert.equal(parsed.context.userId, 'u1');
  assert.equal(parsed.context.action, 'x');
});

test('logger filters messages below configured level', () => {
  const sink = createSink();
  const logger = new Logger({ env: 'production', sink, level: 'warn' });

  logger.info('skip me');
  logger.warn('keep me');

  assert.equal(sink.lines.length, 1);
  const parsed = JSON.parse(sink.lines[0]);
  assert.equal(parsed.level, 'warn');
});
