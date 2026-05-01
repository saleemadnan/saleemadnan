function buildRequest({ baseUrl, accessToken, method = 'GET', endpoint, params = {}, data = null }) {
  const url = new URL(`${baseUrl}/${String(endpoint || '').replace(/^\//, '')}`);

  const queryParams = { ...params };
  if (accessToken) {
    queryParams.access_token = accessToken;
  }

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const requestOptions = { method, headers: {} };
  if (data && method !== 'GET') {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(data);
  }

  return {
    url,
    requestOptions,
  };
}

module.exports = {
  buildRequest,
};
