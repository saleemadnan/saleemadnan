function mockResponse(path, method, payload = {}) {
  return {
    mock: true,
    configured: false,
    message: 'META_ACCESS_TOKEN is missing; returning mock response.',
    path,
    method,
    payload,
    data: [],
    paging: { next: null, previous: null },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  mockResponse,
};
