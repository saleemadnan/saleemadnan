const { MetaApiError, normalizeMetaError } = require('./errors');

function createTokenService(client) {
  return {
    async refreshLongLivedToken({ appId, appSecret, currentToken }) {
      const token = currentToken || client.accessToken;

      if (!appId || !appSecret || !token) {
        throw new MetaApiError('Missing appId, appSecret, or current token for refresh.', 400);
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

module.exports = { createTokenService };
