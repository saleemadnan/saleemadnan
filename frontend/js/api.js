const API = {
  request: async (path, options = {}) => {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    return data;
  },

  // Pages
  getPages: () => API.request('/api/pages'),
  getPageDetails: (id) => API.request(`/api/pages/${id}`),
  getPagePosts: (id) => API.request(`/api/pages/${id}/posts`),
  publishPost: (id, data) => API.request(`/api/pages/${id}/posts`, { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id, postId) => API.request(`/api/pages/${id}/posts/${postId}`, { method: 'DELETE' }),
  getPageInsights: (id, metrics, period = 'day') => {
    const params = new URLSearchParams();
    if (metrics) params.set('metrics', metrics);
    if (period) params.set('period', period);
    return API.request(`/api/pages/${id}/insights?${params.toString()}`);
  },
  getInstagramAccount: (pageId) => API.request(`/api/pages/${pageId}/instagram`),

  // Instagram
  getIGMedia: (igId) => API.request(`/api/instagram/${igId}/media`),
  publishIGPost: (igId, data) => API.request(`/api/instagram/${igId}/publish`, { method: 'POST', body: JSON.stringify(data) }),
  getIGInsights: (igId) => API.request(`/api/instagram/${igId}/insights`),

  // Campaigns / Ads
  getCampaigns: () => API.request('/api/campaigns'),
  createCampaign: (data) => API.request('/api/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => API.request(`/api/campaigns/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteCampaign: (id) => API.request(`/api/campaigns/${id}`, { method: 'DELETE' }),
  getAdSets: () => API.request('/api/adsets'),
  getAds: () => API.request('/api/ads'),
  getCampaignInsights: (id) => API.request(`/api/campaigns/${id}/insights`),

  // Messaging
  getConversations: (pageId) => API.request(`/api/messages?pageId=${encodeURIComponent(pageId || '')}`),
  getMessages: (convId) => API.request(`/api/messages/${convId}`),
  sendReply: (recipientId, message) => API.request('/api/messages/reply', {
    method: 'POST',
    body: JSON.stringify({ recipientId, message }),
  }),
};

window.MetaDashboardApi = API;
