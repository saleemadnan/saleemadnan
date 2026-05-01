const { STATES } = require('./CircuitBreaker');

class HealthCheck {
  constructor({ service, circuitBreaker = null } = {}) {
    this.service = service;
    this.circuitBreaker = circuitBreaker;
    this.customChecks = new Map();
  }

  register(name, fn) {
    this.customChecks.set(name, fn);
  }

  async liveness() {
    return {
      ok: true,
      status: 'live',
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    const checks = {};

    checks.tokenConfigured = Boolean(this.service?.isConfigured);
    checks.circuitOpen = this.circuitBreaker ? this.circuitBreaker.getState() === STATES.OPEN : false;

    for (const [name, fn] of this.customChecks.entries()) {
      checks[name] = await fn();
    }

    const customFailed = Object.entries(checks)
      .filter(([key]) => !['tokenConfigured', 'circuitOpen'].includes(key))
      .some(([, value]) => value === false);

    const ok = checks.tokenConfigured && !checks.circuitOpen && !customFailed;

    return {
      ok,
      status: ok ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  HealthCheck,
};
