const { FailurePolicy } = require('./FailurePolicy');
const { createRetryExhaustedError } = require('./TransportErrorFactory');
const { Logger } = require('./Logger');
const { defaultMetrics } = require('./Metrics');

class RetryStrategy {
  constructor({ maxAttempts = 3, baseDelayMs = 200, jitterRatio = 0.25, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), random = Math.random, failurePolicy = new FailurePolicy(), logger = new Logger({}), metrics = defaultMetrics } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.jitterRatio = jitterRatio;
    this.sleep = sleep;
    this.random = random;
    this.failurePolicy = failurePolicy;
    this.logger = logger;
    this.metrics = metrics;
  }

  getDelay(attempt) {
    const expDelay = this.baseDelayMs * (2 ** attempt);
    const jitter = expDelay * this.jitterRatio * this.random();
    return Math.round(expDelay + jitter);
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

        const delay = this.getDelay(attempt);
        this.metrics.counter('retry_attempts_total', {
          attempt: attempt + 1,
        });

        this.logger.warn('Retry attempt scheduled', {
          attempt: attempt + 1,
          maxAttempts: this.maxAttempts,
          delay,
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
