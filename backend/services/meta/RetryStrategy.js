const { FailurePolicy } = require('./FailurePolicy');
const { createRetryExhaustedError } = require('./TransportErrorFactory');
const { Logger } = require('./Logger');
const { defaultMetrics } = require('./Metrics');

class RetryStrategy {
  constructor({ maxAttempts = 3, baseDelayMs = 200, maxDelayMs = 10_000, jitterRatio = 0.25, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), random = Math.random, now = () => Date.now(), failurePolicy = new FailurePolicy(), logger = new Logger({}), metrics = defaultMetrics } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.jitterRatio = jitterRatio;
    this.sleep = sleep;
    this.random = random;
    this.now = now;
    this.failurePolicy = failurePolicy;
    this.logger = logger;
    this.metrics = metrics;
  }

  getDelay(attempt) {
    const expDelay = this.baseDelayMs * (2 ** attempt);
    const jitter = expDelay * this.jitterRatio * this.random();
    return Math.min(Math.round(expDelay + jitter), this.maxDelayMs);
  }

  getRetryAfterMs(error) {
    const header = error?.response?.headers?.get?.('retry-after');
    if (!header) {
      return null;
    }

    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.round(seconds * 1000);
    }

    const dateMs = Date.parse(header);
    if (!Number.isNaN(dateMs)) {
      return Math.max(0, dateMs - this.now());
    }

    return null;
  }

  async execute(operation) {
    let lastError;

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      try {
        return await operation(attempt);
      } catch (error) {
        lastError = error;

        const { retryable } = this.failurePolicy.classify(error);
        const hasAttemptsLeft = attempt < this.maxAttempts - 1;

        if (!retryable || !hasAttemptsLeft) {
          if (!hasAttemptsLeft && retryable) {
            throw createRetryExhaustedError(this.maxAttempts, error);
          }
          throw error;
        }

        const retryAfterMs = this.getRetryAfterMs(error);
        const delay = retryAfterMs !== null
          ? Math.min(retryAfterMs, this.maxDelayMs)
          : this.getDelay(attempt);
        this.metrics.counter('retry_attempts_total', {
          attempt: attempt + 1,
        });

        this.logger.warn('Retry attempt scheduled', {
          attempt: attempt + 1,
          maxAttempts: this.maxAttempts,
          delay,
          delaySource: retryAfterMs !== null ? 'retry-after' : 'backoff',
          reason: error.message,
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }
}

module.exports = {
  RetryStrategy,
};
