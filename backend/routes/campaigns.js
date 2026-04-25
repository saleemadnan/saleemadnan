const express = require('express');
const { metaApiService } = require('../services/metaApi');

const router = express.Router();

router.get('/api/campaigns', async (req, res) => {
  try {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await metaApiService.getCampaigns(accountId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/campaigns', async (req, res) => {
  try {
    const accountId = req.body.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const payload = {
      name: req.body.name,
      objective: req.body.objective,
      status: req.body.status,
      daily_budget: req.body.daily_budget,
      special_ad_categories: req.body.special_ad_categories || [],
    };
    const data = await metaApiService.createCampaign(accountId, payload);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/campaigns/:id', async (req, res) => {
  try {
    const payload = {
      status: req.body.status,
      daily_budget: req.body.daily_budget,
      name: req.body.name,
    };
    const data = await metaApiService.updateCampaign(req.params.id, payload);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const data = await metaApiService.deleteCampaign(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/campaigns/:id/insights', async (req, res) => {
  try {
    const data = await metaApiService.getCampaignInsights(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/adsets', async (req, res) => {
  try {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await metaApiService.getAdSets(accountId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.post('/api/adsets', async (req, res) => {
  try {
    const accountId = req.body.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await metaApiService.createAdSet(accountId, req.body);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/ads', async (req, res) => {
  try {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await metaApiService.getAds(accountId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

router.get('/api/ads/insights/account', async (req, res) => {
  try {
    const accountId = req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
    const data = await metaApiService.getAdAccountInsights(accountId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

module.exports = router;
