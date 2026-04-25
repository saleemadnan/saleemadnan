const express = require('express');
const { metaApiService } = require('../services/metaApi');

const router = express.Router();

router.get('/api/pages', async (req, res) => {
  try {
    const data = await metaApiService.getPages();
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/pages/:pageId', async (req, res) => {
  try {
    const data = await metaApiService.getPageDetails(req.params.pageId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/pages/:pageId/posts', async (req, res) => {
  try {
    const data = await metaApiService.getPagePosts(req.params.pageId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/pages/:pageId/posts', async (req, res) => {
  try {
    const { type = 'text', message, url, caption, file_url, description, title } = req.body;
    let data;

    if (type === 'photo') {
      data = await metaApiService.publishPagePhoto(req.params.pageId, { url, caption });
    } else if (type === 'video') {
      data = await metaApiService.publishPageVideo(req.params.pageId, { file_url, description, title });
    } else {
      data = await metaApiService.publishPagePost(req.params.pageId, message);
    }

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.delete('/api/pages/:pageId/posts/:postId', async (req, res) => {
  try {
    const data = await metaApiService.deletePost(req.params.postId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/pages/:pageId/insights', async (req, res) => {
  try {
    const data = await metaApiService.getPageInsights(req.params.pageId, {
      since: req.query.since,
      until: req.query.until,
      period: req.query.period || 'day',
    });
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/pages/:pageId/instagram', async (req, res) => {
  try {
    const data = await metaApiService.getInstagramAccountByPage(req.params.pageId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

module.exports = router;
