function createPagesService(client) {
  return {
    getPages: () => client.request('me/accounts'),

    getPageDetails: (pageId) =>
      client.request(`${pageId}`, {
        params: {
          fields:
            'id,name,fan_count,followers_count,about,website,phone,emails,location,picture,cover',
        },
      }),

    publishPagePost: (pageId, message) =>
      client.request(`${pageId}/feed`, {
        method: 'POST',
        body: { message },
      }),

    publishPagePhoto: (pageId, { url, caption }) =>
      client.request(`${pageId}/photos`, {
        method: 'POST',
        body: { url, caption },
      }),

    publishPageVideo: (pageId, { file_url, description, title }) =>
      client.request(`${pageId}/videos`, {
        method: 'POST',
        body: { file_url, description, title },
      }),

    getPagePosts: (pageId) =>
      client.request(`${pageId}/feed`, {
        params: {
          fields:
            'id,message,created_time,likes.summary(true),comments.summary(true),shares,full_picture',
        },
      }),

    getPostComments: (postId) =>
      client.request(`${postId}/comments`, {
        params: { fields: 'id,message,from,created_time,like_count' },
      }),

    replyToComment: (commentId, message) =>
      client.request(`${commentId}/replies`, {
        method: 'POST',
        body: { message },
      }),

    deletePost: (postId) => client.request(`${postId}`, { method: 'DELETE' }),

    likePost: (postId) => client.request(`${postId}/likes`, { method: 'POST' }),

    getPageInsights: (pageId, { since, until, period = 'day' } = {}) =>
      client.request(`${pageId}/insights`, {
        params: {
          metric:
            'page_fans,page_impressions,page_engaged_users,page_post_engagements,page_views_total',
          period,
          since,
          until,
        },
      }),
  };
}

module.exports = { createPagesService };
