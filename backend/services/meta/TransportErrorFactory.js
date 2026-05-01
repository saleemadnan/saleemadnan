const { HttpError, MetaApiError } = require('./errors');

function createNetworkError(cause) {
  const error = new HttpError('Network failure while calling Meta API.', 503, { cause: cause?.message || cause });
  error.cause = cause;
  return error;
}

function createTimeoutError(ms) {
  return new HttpError(`Meta API request timed out after ${ms}ms.`, 504, { timeoutMs: ms });
}

function createCircuitOpenError() {
  return new HttpError('Circuit breaker is open', 503);
}

function createRetryExhaustedError(attempts, lastError) {
  const statusCode = lastError?.statusCode || lastError?.status || lastError?.response?.status || 500;
  const message = `Retry attempts exhausted after ${attempts} attempts: ${lastError?.message || 'Unknown error'}`;
  const error = new HttpError(message, statusCode, { attempts, lastError: lastError?.message || null });
  error.cause = lastError;
  return error;
}

function createApiError(metaCode, message, details = {}) {
  const normalizedMessage = message || 'Meta API returned an error.';
  const error = new MetaApiError(normalizedMessage, details.statusCode || 500, {
    ...details,
    code: metaCode,
  });
  error.response = details.response;
  error.data = details.data;
  error.error = details.error;
  return error;
}

module.exports = {
  createNetworkError,
  createTimeoutError,
  createCircuitOpenError,
  createRetryExhaustedError,
  createApiError,
};
