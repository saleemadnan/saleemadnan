class RetryStrategy {
  constructor({ maxAttempts = 3, baseDelayMs = 200, jitterRatio = 0.25, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), random = Math.random } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.jitterRatio = jitterRatio;
    this.sleep = sleep;
    this.random = random;
  }

  isRetryable(error) {
    const status = error?.statusCode || error?.status || error?.response?.status;

    if (!status) {
      return true; // network/unknown transport issues
    }

    if ([429, 503].includes(status)) {
      return true;
    }

    if ([400, 401, 403].includes(status)) {
      return false;
    }

    return status >= 500;
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

        const retryable = this.isRetryable(error);
        const hasAttemptsLeft = attempt < this.maxAttempts - 1;

        if (!retryable || !hasAttemptsLeft) {
          throw error;
        }

        await this.sleep(this.getDelay(attempt));
      }
    }

    throw lastError;
  }
}

module.exports = {
  RetryStrategy,
};
