class MetaApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'MetaApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function normalizeMetaError(statusCode, errorData = {}) {
  const code = errorData.code;
  const subcode = errorData.error_subcode;
  const message = errorData.message || 'Unknown Meta API error';

  if (statusCode === 429 || code === 4 || code === 17 || code === 613) {
    return new MetaApiError('Meta API rate limit reached. Please retry later.', 429, errorData);
  }

  if (code === 190 || subcode === 463 || subcode === 467) {
    return new MetaApiError('Meta token expired or invalid. Please refresh token.', 401, errorData);
  }

  if (code === 10 || code === 200 || code === 294 || code === 298) {
    return new MetaApiError('Insufficient Meta permissions for this operation.', 403, errorData);
  }

  return new MetaApiError(message, statusCode || 500, errorData);
}

module.exports = {
  MetaApiError,
  normalizeMetaError,
};
