const { META_BASE_URL, MetaApiError, createMetaApiService: createMetaService } = require('./meta');

function createMetaApiService(options = {}) {
  return createMetaService({
    token: options.token,
    adAccountId: options.adAccountId,
    pageId: options.pageId,
    mock: options.mock,
    baseUrl: options.baseUrl,
  });
}

const metaApiService = createMetaApiService();

module.exports = {
  META_BASE_URL,
  MetaApiError,
  createMetaApiService,
  metaApiService,
};
