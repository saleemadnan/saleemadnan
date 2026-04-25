const express = require('express');
const { metaApiService } = require('../services/metaApi');

const router = express.Router();

router.get('/api/messages', async (req, res) => {
  try {
    const pageId = req.query.pageId || process.env.META_PAGE_ID;
    const data = await metaApiService.getConversations(pageId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const data = await metaApiService.getConversationMessages(req.params.conversationId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/messages/reply', async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const data = await metaApiService.sendMessage(recipientId, message);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

module.exports = router;
