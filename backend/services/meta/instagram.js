function createInstagramService(client) {
  return {
    getInstagramAccountByPage: (pageId) =>
      client.request(`${pageId}`, {
        params: { fields: 'instagram_business_account' },
      }),

    getInstagramUserDetails: (igUserId) =>
      client.request(`${igUserId}`, {
        params: {
          fields:
            'id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website',
        },
      }),

    getInstagramMedia: (igUserId) =>
      client.request(`${igUserId}/media`, {
        params: {
          fields:
            'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink',
        },
      }),

    createInstagramContainer: (igUserId, payload) =>
      client.request(`${igUserId}/media`, {
        method: 'POST',
        body: payload,
      }),

    publishInstagramContainer: (igUserId, creationId) =>
      client.request(`${igUserId}/media_publish`, {
        method: 'POST',
        body: { creation_id: creationId },
      }),

    getInstagramInsights: (igUserId, period = 'day') =>
      client.request(`${igUserId}/insights`, {
        params: {
          metric: 'impressions,reach,profile_views,follower_count',
          period,
        },
      }),

    getInstagramMediaInsights: (igMediaId) =>
      client.request(`${igMediaId}/insights`, {
        params: {
          metric: 'impressions,reach,engagement,saved,video_views',
        },
      }),

    getInstagramMentions: (igUserId) => client.request(`${igUserId}/mentions`),
  };
}

module.exports = { createInstagramService };
