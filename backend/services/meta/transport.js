const { HttpError } = require('./errors');
const { CircuitBreaker } = require('./CircuitBreaker');
const { RetryStrategy } = require('./RetryStrategy');

function makeTransport({
  fetchImpl = fetch,
  circuitBreaker = new CircuitBreaker({}),
  retryStrategy = new RetryStrategy({}),
} = {}) {
  async function execute({ url, requestOptions }) {
    if (!circuitBreaker.canRequest()) {
      throw new HttpError('Circuit breaker is open due to high failure rate.', 503);
    }

    try {
      const result = await retryStrategy.execute(async () => {
        const response = await fetchImpl(url, requestOptions);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.error) {
          const error = new Error('Transport HTTP failure');
          error.statusCode = response.status;
          error.response = response;
          error.data = data;
          throw error;
        }

        return { response, data };
      });

      circuitBreaker.onSuccess();
      return result;
    } catch (error) {
      circuitBreaker.onFailure();

      if (error.response && error.data) {
        return { response: error.response, data: error.data };
      }

      throw error;
    }
  }

  return {
    execute,
  };
}

module.exports = {
  makeTransport,
};
