const express = require('express');
const { metaApiService } = require('../services/metaApi');
const { asyncHandler, requireFields } = require('./_shared');

function createCampaignsRouter(service = metaApiService) {
  const router = express.Router();

  router.get('/api/campaigns', asyncHandler(async (req, res) => {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await service.getCampaigns(accountId);
    res.json(data);
  }));

  router.post('/api/campaigns', requireFields(['name', 'objective', 'status', 'daily_budget']), asyncHandler(async (req, res) => {
    const accountId = req.body.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const payload = {
      name: req.body.name,
      objective: req.body.objective,
      status: req.body.status,
      daily_budget: req.body.daily_budget,
      special_ad_categories: req.body.special_ad_categories || [],
    };
    const data = await service.createCampaign(accountId, payload);
    res.json(data);
  }));

  router.post('/api/campaigns/:id', asyncHandler(async (req, res) => {
    const payload = {
      status: req.body.status,
      daily_budget: req.body.daily_budget,
      name: req.body.name,
    };
    const data = await service.updateCampaign(req.params.id, payload);
    res.json(data);
  }));

  router.delete('/api/campaigns/:id', asyncHandler(async (req, res) => {
    const data = await service.deleteCampaign(req.params.id);
    res.json(data);
  }));

  router.get('/api/campaigns/:id/insights', asyncHandler(async (req, res) => {
    const data = await service.getCampaignInsights(req.params.id);
    res.json(data);
  }));

  router.get('/api/adsets', asyncHandler(async (req, res) => {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await service.getAdSets(accountId);
    res.json(data);
  }));

  router.post('/api/adsets', asyncHandler(async (req, res) => {
    const accountId = req.body.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await service.createAdSet(accountId, req.body);
    res.json(data);
  }));

  router.get('/api/ads', asyncHandler(async (req, res) => {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await service.getAds(accountId);
    res.json(data);
  }));

  router.get('/api/ads/insights/account', asyncHandler(async (req, res) => {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await service.getAdAccountInsights(accountId);
    res.json(data);
  }));

  return router;
}

module.exports = createCampaignsRouter();
module.exports.createCampaignsRouter = createCampaignsRouter;
