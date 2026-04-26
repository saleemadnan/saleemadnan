const { META_BASE_URL, MetaClient } = require('./client');
const { MetaApiError } = require('./errors');
const { createPagesService } = require('./pages');
const { createInstagramService } = require('./instagram');
const { createAdsService } = require('./ads');
const { createMessagingService } = require('./messaging');
const { createTokenService } = require('./tokens');

function createMetaApiService(config = {}) {
  const accessToken = config.token ?? config.accessToken ?? (process.env.META_ACCESS_TOKEN || '');
  const forceMock = Boolean(config.mock);
  const client = new MetaClient({
    baseUrl: config.baseUrl || META_BASE_URL,
    accessToken,
    forceMock,
  });

  const adAccountId = config.adAccountId || process.env.META_AD_ACCOUNT_ID || '';
  const pageId = config.pageId || process.env.META_PAGE_ID || '';

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
    ...createAdsService(client, adAccountId),
    ...createMessagingService(client, pageId),
    ...createTokenService(client),
  };
}

module.exports = {
  META_BASE_URL,
  MetaApiError,
  createMetaApiService,
};
