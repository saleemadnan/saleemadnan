const express = require('express');
const { metaApiService } = require('../services/metaApi');
const { asyncHandler, requireFields } = require('./_shared');

function createMessagingRouter(service = metaApiService) {
  const router = express.Router();

  router.get('/api/messages', asyncHandler(async (req, res) => {
    const pageId = req.query.pageId || process.env.META_PAGE_ID;
    const data = await service.getConversations(pageId);
    res.json(data);
  }));

  router.get('/api/messages/:conversationId', asyncHandler(async (req, res) => {
    const data = await service.getConversationMessages(req.params.conversationId);
    res.json(data);
  }));

  router.post('/api/messages/reply', requireFields(['recipientId', 'message']), asyncHandler(async (req, res) => {
    const { recipientId, message } = req.body;
    const data = await service.sendMessage(recipientId, message);
    res.json(data);
  }));

  return router;
}

module.exports = createMessagingRouter();
module.exports.createMessagingRouter = createMessagingRouter;
