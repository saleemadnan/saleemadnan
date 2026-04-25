const { META_BASE_URL, MetaApiError, createMetaApiService } = require('./meta');

const metaApiService = createMetaApiService();

module.exports = {
  META_BASE_URL,
  MetaApiError,
  createMetaApiService,
  metaApiService,
};
