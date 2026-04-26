const express = require('express');
const dotenv = require('dotenv');
const { metaApiService } = require('./services/metaApi');
const { HealthCheck } = require('./services/meta/HealthCheck');
const { defaultMetrics } = require('./services/meta/Metrics');
const { baseLogger, asyncHandler } = require('./routes/_shared');
const { setupRoutes } = require('./bootstrap/routesSetup');
const { setupObservability } = require('./bootstrap/observabilitySetup');
const { createServer, registerShutdownHandlers } = require('./bootstrap/lifecycleSetup');
const { createCampaignsRouter } = require('./routes/campaigns');
const { createMessagingRouter } = require('./routes/messaging');
const { createPagesRouter } = require('./routes/pages');
const { createInstagramRouter } = require('./routes/instagram');

dotenv.config();

const requiredEnvKeys = [
  'META_ACCESS_TOKEN',
  'META_AD_ACCOUNT_ID',
  'META_PAGE_ID',
  'META_APP_ID',
  'META_APP_SECRET',
  'INTERNAL_API_KEY',
];

function createApp(service = metaApiService, options = {}) {
  const app = express();
  const healthCheck = options.healthCheck || new HealthCheck({
    service,
    circuitBreaker: options.circuitBreaker,
  });

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

  setupObservability(app, {
    metrics: defaultMetrics,
    logger: options.logger || baseLogger,
    healthCheck,
  });

  setupRoutes(app, {
    metaApiService: service,
    createCampaignsRouter,
    createMessagingRouter,
    createPagesRouter,
    createInstagramRouter,
  });

  return app;
}

function startServer({ service = metaApiService, options = {} } = {}) {
  const app = createApp(service, options);
  const server = createServer(app);
  const port = Number(process.env.PORT || 3000);

  let activeConnections = 0;
  server.on('connection', (socket) => {
    activeConnections += 1;
    defaultMetrics.gauge('active_connections', activeConnections);

    socket.on('close', () => {
      activeConnections = Math.max(0, activeConnections - 1);
      defaultMetrics.gauge('active_connections', activeConnections);
    });
  });

  registerShutdownHandlers(server, {
    logger: options.logger || baseLogger,
    timeoutMs: 30_000,
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
