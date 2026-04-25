const express = require('express');
const dotenv = require('dotenv');
const campaignsRoutes = require('./routes/campaigns');
const messagingRoutes = require('./routes/messaging');
const pagesRoutes = require('./routes/pages');
const instagramRoutes = require('./routes/instagram');
const { metaApiService } = require('./services/metaApi');

dotenv.config();

const app = express();
app.use(express.json());

const requiredEnvKeys = [
  'META_ACCESS_TOKEN',
  'META_AD_ACCOUNT_ID',
  'META_PAGE_ID',
  'META_APP_ID',
  'META_APP_SECRET',
  'INTERNAL_API_KEY',
];

app.get('/api/health', (req, res) => {
  const configured = requiredEnvKeys.reduce((acc, key) => {
    acc[key] = Boolean(process.env[key]);
    return acc;
  }, {});

  res.json({
    ok: true,
    metaBaseUrl: 'https://graph.facebook.com/v19.0',
    tokenStatus: process.env.META_ACCESS_TOKEN ? 'connected' : 'disconnected',
    env: configured,
  });
});

app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const internalApiKey = req.headers['x-internal-api-key'];
    if (!process.env.INTERNAL_API_KEY || internalApiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await metaApiService.refreshLongLivedToken({
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
      currentToken: req.body.currentToken || process.env.META_ACCESS_TOKEN,
    });

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message, details: error.details });
  }
});

app.use(campaignsRoutes);
app.use(messagingRoutes);
app.use(pagesRoutes);
app.use(instagramRoutes);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
