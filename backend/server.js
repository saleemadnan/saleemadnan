const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const campaignsRoutes = require('./routes/campaigns');
const messagingRoutes = require('./routes/messaging');
const pagesRoutes = require('./routes/pages');
const instagramRoutes = require('./routes/instagram');
const { metaApiService } = require('./services/metaApi');
const { asyncHandler, errorMiddleware } = require('./routes/_shared');

dotenv.config();

const requiredEnvKeys = [
  'META_ACCESS_TOKEN',
  'META_AD_ACCOUNT_ID',
  'META_PAGE_ID',
  'META_APP_ID',
  'META_APP_SECRET',
  'INTERNAL_API_KEY',
];

function createApp(service = metaApiService) {
  const app = express();
  app.use(express.json());

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

  const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    message: {
      error: 'Too many requests, please try again later.',
    },
  });

  app.use('/api', apiRateLimiter);

  app.post('/api/auth/refresh-token', asyncHandler(async (req, res) => {
    const internalApiKey = req.headers['x-internal-api-key'];
    if (!process.env.INTERNAL_API_KEY || internalApiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await service.refreshLongLivedToken({
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
      currentToken: req.body.currentToken || process.env.META_ACCESS_TOKEN,
    });

    return res.json(data);
  }));

  app.use(campaignsRoutes);
  app.use(messagingRoutes);
  app.use(pagesRoutes);
  app.use(instagramRoutes);
  app.use(errorMiddleware);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { createApp };
