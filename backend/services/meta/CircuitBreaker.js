const { createCircuitOpenError } = require('./TransportErrorFactory');
const { Logger } = require('./Logger');
const { defaultMetrics } = require('./Metrics');

const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

const STATE_METRIC_VALUE = {
  CLOSED: 0,
  HALF_OPEN: 1,
  OPEN: 2,
};

class CircuitBreaker {
  constructor({ threshold = 0.5, windowSize = 10, cooldownMs = 30_000, now = () => Date.now(), logger = new Logger({}), metrics = defaultMetrics } = {}) {
    this.threshold = threshold;
    this.windowSize = windowSize;
    this.cooldownMs = cooldownMs;
    this.now = now;
    this.logger = logger;
    this.metrics = metrics;

    this.state = STATES.CLOSED;
    this.lastOpenedAt = null;
    this.history = [];
    this.#recordMetric();
  }

  getState() {
    if (this.state === STATES.OPEN && this.lastOpenedAt && (this.now() - this.lastOpenedAt >= this.cooldownMs)) {
      this.#transitionTo(STATES.HALF_OPEN, 'Cooldown elapsed');
    }

    return this.state;
  }

  canRequest() {
    return this.getState() !== STATES.OPEN;
  }

  assertCanRequest() {
    if (!this.canRequest()) {
      throw createCircuitOpenError();
    }
  }

  onSuccess() {
    const current = this.getState();

    if (current === STATES.HALF_OPEN) {
      this.#transitionTo(STATES.CLOSED, 'Half-open probe succeeded');
      this.history = [];
      this.lastOpenedAt = null;
      return;
    }

    this.#record(true);
  }

  onFailure() {
    const current = this.getState();

    if (current === STATES.HALF_OPEN) {
      this.#open();
      return;
    }

    this.#record(false);
    this.#evaluateThreshold();
  }

  #open() {
    this.#transitionTo(STATES.OPEN, 'Failure threshold exceeded');
    this.lastOpenedAt = this.now();
  }

  #transitionTo(nextState, reason) {
    const prevState = this.state;
    this.state = nextState;
    this.#recordMetric();

    if (prevState !== nextState) {
      this.logger.warn('Circuit breaker state changed', {
        from: prevState,
        to: nextState,
        reason,
      });
    }
  }

  #recordMetric() {
    this.metrics.gauge('circuit_breaker_state', STATE_METRIC_VALUE[this.state]);
  }

  #record(success) {
    this.history.push(success);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
  }

  #evaluateThreshold() {
    if (this.history.length < this.windowSize) {
      return;
    }

    const failures = this.history.filter((x) => !x).length;
    const failureRate = failures / this.windowSize;
    if (failureRate > this.threshold) {
      this.#open();
    }
  }
}

module.exports = {
  CircuitBreaker,
  STATES,
};
