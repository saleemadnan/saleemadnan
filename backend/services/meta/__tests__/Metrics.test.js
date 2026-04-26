const test = require('node:test');
const assert = require('node:assert/strict');

const { Metrics } = require('../Metrics');

test('Metrics supports counter/histogram/gauge and exports prometheus format', () => {
  const metrics = new Metrics();

  metrics.counter('http_requests_total', { method: 'GET', status: 200, route: '/x' });
  metrics.counter('http_requests_total', { method: 'GET', status: 200, route: '/x' });
  metrics.histogram('http_request_duration_ms', 120, { method: 'GET', route: '/x' });
  metrics.histogram('http_request_duration_ms', 80, { method: 'GET', route: '/x' });
  metrics.gauge('circuit_breaker_state', 2);

  const output = metrics.exportPrometheus();

  assert.match(output, /http_requests_total\{method="GET",route="\/x",status="200"\} 2/);
  assert.match(output, /http_request_duration_ms_count\{method="GET",route="\/x"\} 2/);
  assert.match(output, /http_request_duration_ms_sum\{method="GET",route="\/x"\} 200/);
  assert.match(output, /circuit_breaker_state 2/);
});
