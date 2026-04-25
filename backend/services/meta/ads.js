function normalizeAdAccountId(adAccountId) {
  if (!adAccountId) {
    return adAccountId;
  }
  return String(adAccountId).startsWith('act_') ? String(adAccountId) : `act_${adAccountId}`;
}

function createAdsService(client, defaultAdAccountId = process.env.META_AD_ACCOUNT_ID || '') {
  const resolveAccountId = (value) => normalizeAdAccountId(value || defaultAdAccountId);

  return {
    getCampaigns: (adAccountId) =>
      client.request(`${resolveAccountId(adAccountId)}/campaigns`, {
        params: {
          fields:
            'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,reach,clicks,ctr,cpc,cpm,spend}',
        },
      }),

    createCampaign: (adAccountId, payload) =>
      client.request(`${resolveAccountId(adAccountId)}/campaigns`, {
        method: 'POST',
        body: payload,
      }),

    updateCampaign: (campaignId, payload) =>
      client.request(`${campaignId}`, {
        method: 'POST',
        body: payload,
      }),

    deleteCampaign: (campaignId) => client.request(`${campaignId}`, { method: 'DELETE' }),

    getAdSets: (adAccountId) =>
      client.request(`${resolveAccountId(adAccountId)}/adsets`, {
        params: {
          fields: 'id,name,campaign_id,status,targeting,daily_budget,bid_amount',
        },
      }),

    createAdSet: (adAccountId, payload) =>
      client.request(`${resolveAccountId(adAccountId)}/adsets`, {
        method: 'POST',
        body: payload,
      }),

    getAds: (adAccountId) =>
      client.request(`${resolveAccountId(adAccountId)}/ads`, {
        params: {
          fields: 'id,name,adset_id,status,creative,insights{impressions,clicks,spend,ctr}',
        },
      }),

    getAdAccountInsights: (adAccountId) =>
      client.request(`${resolveAccountId(adAccountId)}/insights`, {
        params: {
          fields: 'impressions,reach,clicks,ctr,cpc,cpm,spend,actions',
          date_preset: 'last_28d',
          breakdowns: 'age,gender',
        },
      }),

    getCampaignInsights: (campaignId) =>
      client.request(`${campaignId}/insights`, {
        params: {
          fields: 'impressions,reach,clicks,ctr,cpc,cpm,spend,actions',
          date_preset: 'last_7d',
        },
      }),
  };
}

module.exports = {
  createAdsService,
  normalizeAdAccountId,
};
