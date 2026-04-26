class FailurePolicy {
  classify(error = {}) {
    const code = error.code;
    const status = error.statusCode || error.status || error.response?.status || error.details?.statusCode;
    const metaCode = error.data?.error?.code || error.data?.code || error.error?.code || error.details?.code;
    const message = String(error.message || '').toLowerCase();

    if (this.#isNetworkError(code, message)) {
      return {
        source: 'network',
        shouldCount: true,
        retryable: true,
      };
    }

    if (status || metaCode) {
      const retryable = [429, 503].includes(status) || metaCode === 80004 || (status >= 500 && status < 600);
      const shouldCount = retryable || status >= 500;

      return {
        source: 'api',
        shouldCount,
        retryable,
      };
    }

    return {
      source: 'unknown',
      shouldCount: true,
      retryable: true,
    };
  }

  #isNetworkError(code, message) {
    const networkCodes = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN']);

    if (networkCodes.has(code)) {
      return true;
    }

    return message.includes('fetch failed') || message.includes('network') || message.includes('timeout');
  }
}

module.exports = {
  FailurePolicy,
};
