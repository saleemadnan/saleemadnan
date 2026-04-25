function createMessagingService(client, defaultPageId = process.env.META_PAGE_ID || '') {
  return {
    getConversations: (pageId = defaultPageId) =>
      client.request(`${pageId}/conversations`, {
        params: {
          fields: 'id,participants,updated_time,message_count,unread_count',
        },
      }),

    getConversationMessages: (conversationId) =>
      client.request(`${conversationId}/messages`, {
        params: {
          fields: 'id,message,from,created_time,attachments',
        },
      }),

    sendMessage: (recipientId, message) =>
      client.request('me/messages', {
        method: 'POST',
        body: {
          recipient: { id: recipientId },
          message: { text: message },
        },
      }),
  };
}

module.exports = { createMessagingService };
