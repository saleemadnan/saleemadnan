const express = require('express');
const { metaApiService } = require('../services/metaApi');
const { asyncHandler, requireFields } = require('./_shared');

function createInstagramRouter(service = metaApiService) {
  const router = express.Router();

  router.get('/api/instagram/:igUserId', asyncHandler(async (req, res) => {
    const data = await service.getInstagramUserDetails(req.params.igUserId);
    res.json(data);
  }));

  router.get('/api/instagram/:igUserId/media', asyncHandler(async (req, res) => {
    const data = await service.getInstagramMedia(req.params.igUserId);
    res.json(data);
  }));

  router.post('/api/instagram/:igUserId/publish', requireFields(['image_url']), asyncHandler(async (req, res) => {
    const container = await service.createInstagramContainer(req.params.igUserId, req.body);
    const published = await service.publishInstagramContainer(req.params.igUserId, container.id);
    res.json({ container, published });
  }));

  router.get('/api/instagram/:igUserId/insights', asyncHandler(async (req, res) => {
    const data = await service.getInstagramInsights(req.params.igUserId, req.query.period || 'day');
    res.json(data);
  }));

  router.get('/api/instagram/:igUserId/mentions', asyncHandler(async (req, res) => {
    const data = await service.getInstagramMentions(req.params.igUserId);
    res.json(data);
  }));

  return router;
}

module.exports = createInstagramRouter();
module.exports.createInstagramRouter = createInstagramRouter;
