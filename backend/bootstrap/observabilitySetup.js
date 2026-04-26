const { asyncHandler, requestIdMiddleware, metricsMiddleware } = require('../routes/_shared');

function setupObservability(app, { metrics, healthCheck }) {
  app.use(requestIdMiddleware);
  app.use(metricsMiddleware);

  app.get('/metrics', (req, res) => {
    const internalApiKey = req.headers['x-internal-api-key'];
    if (!process.env.INTERNAL_API_KEY || internalApiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    return res.send(metrics.exportPrometheus());
  });

  app.get('/health/live', asyncHandler(async (req, res) => {
    const result = await healthCheck.liveness();
    res.status(200).json(result);
  }));

  app.get('/health/ready', asyncHandler(async (req, res) => {
    const result = await healthCheck.readiness();
    res.status(result.ok ? 200 : 503).json(result);
  }));
}

module.exports = {
  setupObservability,
};
