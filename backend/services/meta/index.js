const { META_BASE_URL, MetaClient } = require('./client');
const { MetaApiError } = require('./errors');
const { createPagesService } = require('./pages');
const { createInstagramService } = require('./instagram');
const { createAdsService } = require('./ads');
const { createMessagingService } = require('./messaging');
const { createTokenService } = require('./tokens');

function createMetaApiService(config = {}) {
  const client = new MetaClient(config);

  return {
    baseUrl: client.baseUrl,
    get accessToken() {
      return client.accessToken;
    },
    get isConfigured() {
      return client.isConfigured;
    },
    updateToken: (token) => client.updateToken(token),
    request: (...args) => client.request(...args),
    ...createPagesService(client),
    ...createInstagramService(client),
    ...createAdsService(client, process.env.META_AD_ACCOUNT_ID || ''),
    ...createMessagingService(client, process.env.META_PAGE_ID || ''),
    ...createTokenService(client),
  };
}

module.exports = {
  META_BASE_URL,
  MetaApiError,
  createMetaApiService,
};
