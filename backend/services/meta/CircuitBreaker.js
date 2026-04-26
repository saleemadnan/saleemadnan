const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

class CircuitBreaker {
  constructor({ threshold = 0.5, windowSize = 10, cooldownMs = 30_000, now = () => Date.now() } = {}) {
    this.threshold = threshold;
    this.windowSize = windowSize;
    this.cooldownMs = cooldownMs;
    this.now = now;

    this.state = STATES.CLOSED;
    this.lastOpenedAt = null;
    this.history = [];
  }

  getState() {
    if (this.state === STATES.OPEN && this.lastOpenedAt && (this.now() - this.lastOpenedAt >= this.cooldownMs)) {
      this.state = STATES.HALF_OPEN;
    }

    return this.state;
  }

  canRequest() {
    return this.getState() !== STATES.OPEN;
  }

  onSuccess() {
    const current = this.getState();

    if (current === STATES.HALF_OPEN) {
      this.state = STATES.CLOSED;
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
    this.state = STATES.OPEN;
    this.lastOpenedAt = this.now();
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
