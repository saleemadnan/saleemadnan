const express = require('express');
const { metaApiService } = require('../services/metaApi');
const { asyncHandler, requireFields } = require('./_shared');

function createPagesRouter(service = metaApiService) {
  const router = express.Router();

  router.get('/api/pages', asyncHandler(async (req, res) => {
    const data = await service.getPages();
    res.json(data);
  }));

  router.get('/api/pages/:pageId', asyncHandler(async (req, res) => {
    const data = await service.getPageDetails(req.params.pageId);
    res.json(data);
  }));

  router.get('/api/pages/:pageId/posts', asyncHandler(async (req, res) => {
    const data = await service.getPagePosts(req.params.pageId);
    res.json(data);
  }));

  router.post('/api/pages/:pageId/posts', requireFields(['type']), asyncHandler(async (req, res) => {
    const { type, message, url, caption, file_url, description, title } = req.body;
    let data;

    if (type === 'photo') {
      data = await service.publishPagePhoto(req.params.pageId, { url, caption });
    } else if (type === 'video') {
      data = await service.publishPageVideo(req.params.pageId, { file_url, description, title });
    } else {
      if (!message) {
        return res.status(400).json({ error: 'message is required for text post' });
      }
      data = await service.publishPagePost(req.params.pageId, message);
    }

    res.json(data);
  }));

  router.delete('/api/pages/:pageId/posts/:postId', asyncHandler(async (req, res) => {
    const data = await service.deletePost(req.params.postId);
    res.json(data);
  }));

  router.get('/api/pages/:pageId/insights', asyncHandler(async (req, res) => {
    const data = await service.getPageInsights(req.params.pageId, {
      since: req.query.since,
      until: req.query.until,
      period: req.query.period || 'day',
    });
    res.json(data);
  }));

  router.get('/api/pages/:pageId/instagram', asyncHandler(async (req, res) => {
    const data = await service.getInstagramAccountByPage(req.params.pageId);
    res.json(data);
  }));

  return router;
}

module.exports = createPagesRouter();
module.exports.createPagesRouter = createPagesRouter;
