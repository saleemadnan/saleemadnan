const { HttpError, MetaApiError, normalizeMetaError } = require('./errors');
const { mockResponse } = require('./mocks');

const META_BASE_URL = 'https://graph.facebook.com/v19.0';

class MetaClient {
  constructor({ baseUrl = META_BASE_URL, accessToken = process.env.META_ACCESS_TOKEN || '', forceMock = false } = {}) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.forceMock = forceMock;
    this.isConfigured = Boolean(accessToken);
  }

  updateToken(nextToken) {
    this.accessToken = nextToken;
    this.isConfigured = Boolean(nextToken);
  }

  async request(path, { method = 'GET', params = {}, body = null } = {}) {
    if (this.forceMock || !this.isConfigured) {
      return mockResponse(path, method, { params, body });
    }

    const url = new URL(`${this.baseUrl}/${path.replace(/^\//, '')}`);
    const mergedParams = { ...params, access_token: this.accessToken };

    Object.entries(mergedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const options = { method, headers: {} };
      if (body && method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw normalizeMetaError(response.status, data.error || data);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError || error instanceof MetaApiError) {
        throw error;
      }

      const metaPayload = error.response?.data?.error || error.response?.data || error.error;
      if (metaPayload) {
        throw normalizeMetaError(error.response?.status || 500, metaPayload);
      }

      throw new MetaApiError(`Meta API request failed: ${error.message}`, 502, {
        originalError: error.message,
      });
    }
  }
}

module.exports = {
  META_BASE_URL,
  MetaClient,
};
