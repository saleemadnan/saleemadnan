const express = require('express');
const { metaApiService } = require('../services/metaApi');

const router = express.Router();

router.get('/api/instagram/:igUserId', async (req, res) => {
  try {
    const data = await metaApiService.getInstagramUserDetails(req.params.igUserId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/instagram/:igUserId/media', async (req, res) => {
  try {
    const data = await metaApiService.getInstagramMedia(req.params.igUserId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/instagram/:igUserId/publish', async (req, res) => {
  try {
    const container = await metaApiService.createInstagramContainer(req.params.igUserId, req.body);
    const published = await metaApiService.publishInstagramContainer(
      req.params.igUserId,
      container.id
    );
    res.json({ container, published });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/instagram/:igUserId/insights', async (req, res) => {
  try {
    const data = await metaApiService.getInstagramInsights(
      req.params.igUserId,
      req.query.period || 'day'
    );
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/instagram/:igUserId/mentions', async (req, res) => {
  try {
    const data = await metaApiService.getInstagramMentions(req.params.igUserId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

module.exports = router;
