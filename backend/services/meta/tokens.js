const { MetaApiError, normalizeMetaError } = require('./errors');

const TOKEN_CACHE = new Map();

function getCacheKey({ appId, currentToken }) {
  return `${appId}:${currentToken}`;
}

function getExpiryMs(data) {
  const now = Date.now();

  if (Number.isFinite(data.expires_in)) {
    return now + (Number(data.expires_in) * 1000) - (5 * 60 * 1000);
  }

  if (Number.isFinite(data.expiry_time)) {
    return (Number(data.expiry_time) * 1000) - (5 * 60 * 1000);
  }

  return now + (55 * 60 * 1000);
}

function readTokenCache(key) {
  const cached = TOKEN_CACHE.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() >= cached.expiresAt) {
    TOKEN_CACHE.delete(key);
    return null;
  }

  return cached.data;
}

function writeTokenCache(key, data) {
  TOKEN_CACHE.set(key, {
    data,
    expiresAt: getExpiryMs(data),
  });
}

function createTokenService(client) {
  return {
    async refreshLongLivedToken({ appId, appSecret, currentToken }) {
      const token = currentToken || client.accessToken;

      if (!appId || !appSecret || !token) {
        throw new MetaApiError('Missing appId, appSecret, or current token for refresh.', 400);
      }

      const cacheKey = getCacheKey({ appId, currentToken: token });
      const cached = readTokenCache(cacheKey);
      if (cached) {
        if (cached.access_token) {
          client.updateToken(cached.access_token);
        }
        return cached;
      }

      const url = new URL(`${client.baseUrl}/oauth/access_token`);
      url.searchParams.set('grant_type', 'fb_exchange_token');
      url.searchParams.set('client_id', appId);
      url.searchParams.set('client_secret', appSecret);
      url.searchParams.set('fb_exchange_token', token);

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw normalizeMetaError(response.status, data.error || data);
        }

        if (data.access_token) {
          client.updateToken(data.access_token);
        }

        writeTokenCache(cacheKey, data);
        return data;
      } catch (error) {
        if (error instanceof MetaApiError) {
          throw error;
        }

        throw new MetaApiError(`Token refresh failed: ${error.message}`, 502);
      }
    },
  };
}

module.exports = {
  createTokenService,
  TOKEN_CACHE,
};
