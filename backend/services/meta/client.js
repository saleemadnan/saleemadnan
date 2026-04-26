const { HttpError, normalizeMetaError } = require('./errors');
const { buildRequest } = require('./requestBuilder');
const { makeTransport } = require('./transport');
const { translateMetaError } = require('./errorTranslator');
const { mockResponse } = require('./mocks');

const META_BASE_URL = 'https://graph.facebook.com/v19.0';

function makeClient({ requestBuilder = buildRequest, transport = makeTransport(), errorTranslator = translateMetaError } = {}) {
  return {
    async request({ baseUrl, accessToken, forceMock, endpoint, method, params, body }) {
      if (forceMock || !accessToken) {
        return mockResponse(endpoint, method, { params, body });
      }

      const { url, requestOptions } = requestBuilder({
        baseUrl,
        accessToken,
        method,
        endpoint,
        params,
        data: body,
      });

      try {
        const { response, data } = await transport.execute({ url, requestOptions });
        if (!response.ok || data.error) {
          throw normalizeMetaError(response.status, data.error || data);
        }
        return data;
      } catch (error) {
        throw errorTranslator(error);
      }
    },
  };
}

class MetaClient {
  constructor({ baseUrl = META_BASE_URL, accessToken = process.env.META_ACCESS_TOKEN || '', forceMock = false, client = null } = {}) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.forceMock = forceMock;
    this.isConfigured = Boolean(accessToken);
    this.client = client || makeClient({});
  }

  updateToken(nextToken) {
    this.accessToken = nextToken;
    this.isConfigured = Boolean(nextToken);
  }

  async request(path, { method = 'GET', params = {}, body = null } = {}) {
    const result = await this.client.request({
      baseUrl: this.baseUrl,
      accessToken: this.accessToken,
      forceMock: this.forceMock,
      endpoint: path,
      method,
      params,
      body,
    });

    if (result?.mock) {
      this.isConfigured = false;
    }

    return result;
  }
}

module.exports = {
  META_BASE_URL,
  MetaClient,
  makeClient,
};
