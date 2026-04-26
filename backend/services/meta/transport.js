const { HttpError } = require('./errors');

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 200;
const CIRCUIT_WINDOW = 10;
const CIRCUIT_FAILURE_THRESHOLD = 0.5;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(status) {
  return status === 429 || status >= 500;
}

function createTransport({ fetchImpl = fetch } = {}) {
  const recentOutcomes = [];

  function recordOutcome(success) {
    recentOutcomes.push(success);
    if (recentOutcomes.length > CIRCUIT_WINDOW) {
      recentOutcomes.shift();
    }
  }

  function circuitOpen() {
    if (recentOutcomes.length < CIRCUIT_WINDOW) {
      return false;
    }

    const failures = recentOutcomes.filter((x) => !x).length;
    return (failures / CIRCUIT_WINDOW) > CIRCUIT_FAILURE_THRESHOLD;
  }

  async function execute({ url, requestOptions }) {
    if (circuitOpen()) {
      throw new HttpError('Circuit breaker is open due to high failure rate.', 503);
    }

    let lastResponse = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetchImpl(url, requestOptions);
        const data = await response.json().catch(() => ({}));
        lastResponse = { response, data };

        if (response.ok && !data.error) {
          recordOutcome(true);
          return { response, data };
        }

        if (attempt < MAX_RETRIES - 1 && isRetryable(response.status)) {
          await wait(BASE_BACKOFF_MS * (2 ** attempt));
          continue;
        }

        recordOutcome(false);
        return { response, data };
      } catch (error) {
        if (attempt < MAX_RETRIES - 1) {
          await wait(BASE_BACKOFF_MS * (2 ** attempt));
          continue;
        }
        recordOutcome(false);
        throw error;
      }
    }

    recordOutcome(false);
    return lastResponse || {
      response: { ok: false, status: 500 },
      data: { error: { message: 'Unknown transport failure' } },
    };
  }

  return {
    execute,
    _state: { recentOutcomes },
  };
}

module.exports = {
  createTransport,
  isRetryable,
};
