const { CircuitBreaker } = require('./CircuitBreaker');
const { RetryStrategy } = require('./RetryStrategy');
const { FailurePolicy } = require('./FailurePolicy');
const { Logger } = require('./Logger');
const { defaultMetrics } = require('./Metrics');
const {
  createNetworkError,
  createTimeoutError,
  createApiError,
} = require('./TransportErrorFactory');

function sanitizeUrl(urlValue) {
  try {
    const parsed = new URL(String(urlValue));
    if (parsed.searchParams.has('access_token')) {
      parsed.searchParams.set('access_token', '[REDACTED]');
    }
    return parsed.toString();
  } catch (error) {
    return String(urlValue);
  }
}

function makeTransport({
  fetchImpl = fetch,
  circuitBreaker = new CircuitBreaker({}),
  failurePolicy = new FailurePolicy(),
  retryStrategy = new RetryStrategy({ failurePolicy }),
  timeoutMs = 15_000,
  logger = new Logger({}),
  metrics = defaultMetrics,
} = {}) {
  async function execute({ url, requestOptions }) {
    const startedAt = Date.now();
    logger.debug('Meta transport request started', {
      url: sanitizeUrl(url),
      method: requestOptions?.method || 'GET',
    });

    circuitBreaker.assertCanRequest();

    try {
      const result = await retryStrategy.execute(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);

        try {
          const response = await fetchImpl(url, { ...requestOptions, signal: controller.signal });
          const data = await response.json().catch(() => ({}));

          if (!response.ok || data.error) {
            throw createApiError(
              data?.error?.code || data?.code,
              data?.error?.message || data?.message || 'Transport HTTP failure',
              {
                statusCode: response.status,
                response,
                data,
                error: data?.error,
              }
            );
          }

          return { response, data };
        } catch (error) {
          if (error?.name === 'AbortError' || error === 'timeout') {
            throw createTimeoutError(timeoutMs);
          }

          if (error?.statusCode || error?.response) {
            throw error;
          }

          throw createNetworkError(error);
        } finally {
          clearTimeout(timer);
        }
      });

      circuitBreaker.onSuccess();
      const durationMs = Date.now() - startedAt;
      logger.info('Meta transport request completed', {
        url: sanitizeUrl(url),
        method: requestOptions?.method || 'GET',
        status: result.response?.status,
        durationMs,
      });
      metrics.histogram('meta_api_request_duration_ms', durationMs, {
        method: requestOptions?.method || 'GET',
        status: result.response?.status || 0,
      });
      return result;
    } catch (error) {
      const { shouldCount } = failurePolicy.classify(error);
      if (shouldCount) {
        circuitBreaker.onFailure();
      }

      const durationMs = Date.now() - startedAt;
      logger.error('Meta transport request failed', {
        url: sanitizeUrl(url),
        method: requestOptions?.method || 'GET',
        status: error.statusCode || error.response?.status,
        durationMs,
        reason: error.message,
      });
      metrics.histogram('meta_api_request_duration_ms', durationMs, {
        method: requestOptions?.method || 'GET',
        status: error.statusCode || error.response?.status || 0,
      });

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
  sanitizeUrl,
};
