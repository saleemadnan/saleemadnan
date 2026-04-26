const { HttpError, MetaApiError, normalizeMetaError } = require('./errors');

function translateMetaError(error, fallbackStatusCode = 500) {
  if (error instanceof HttpError || error instanceof MetaApiError) {
    return error;
  }

  const metaPayload = error?.response?.data?.error || error?.response?.data || error?.error;
  if (metaPayload) {
    return normalizeMetaError(error?.response?.status || fallbackStatusCode, metaPayload);
  }

  return new MetaApiError(`Meta API request failed: ${error.message}`, 502, {
    originalError: error.message,
  });
}

module.exports = {
  translateMetaError,
};
