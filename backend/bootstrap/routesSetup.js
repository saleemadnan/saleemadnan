const rateLimit = require('express-rate-limit');
const campaignsRoutes = require('../routes/campaigns');
const messagingRoutes = require('../routes/messaging');
const pagesRoutes = require('../routes/pages');
const instagramRoutes = require('../routes/instagram');
const { errorMiddleware } = require('../routes/_shared');

function setupRoutes(app, services = {}) {
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

  const routes = {
    campaigns: services.createCampaignsRouter ? services.createCampaignsRouter(services.metaApiService) : campaignsRoutes,
    messaging: services.createMessagingRouter ? services.createMessagingRouter(services.metaApiService) : messagingRoutes,
    pages: services.createPagesRouter ? services.createPagesRouter(services.metaApiService) : pagesRoutes,
    instagram: services.createInstagramRouter ? services.createInstagramRouter(services.metaApiService) : instagramRoutes,
  };

  app.use(routes.campaigns);
  app.use(routes.messaging);
  app.use(routes.pages);
  app.use(routes.instagram);

  app.use(errorMiddleware);
}

module.exports = {
  setupRoutes,
};
