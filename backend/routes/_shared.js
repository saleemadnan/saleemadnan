const crypto = require('crypto');
const { Logger } = require('../services/meta/Logger');
const { defaultMetrics } = require('../services/meta/Metrics');

const baseLogger = new Logger({});

function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function isBlankString(value) {
  return typeof value === 'string' && value.trim().length === 0;
}

function requireFields(fields = []) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || isBlankString(value);
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

function requestIdMiddleware(req, res, next) {
  const headerId = req.headers['x-request-id'];
  const requestId = headerId || crypto.randomUUID();

  req.requestId = requestId;
  req.log = baseLogger.child({ requestId });
  res.setHeader('X-Request-Id', requestId);

  next();
}

function metricsMiddleware(req, res, next) {
  const started = Date.now();
  defaultMetrics.gauge('http_requests_in_flight', (defaultMetrics.getGaugeValue('http_requests_in_flight') || 0) + 1);

  res.on('finish', () => {
    const duration = Date.now() - started;
    const route = req.route?.path || req.path;

    defaultMetrics.counter('http_requests_total', {
      method: req.method,
      status: res.statusCode,
      route,
    });

    defaultMetrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      route,
    });

    const current = defaultMetrics.getGaugeValue('http_requests_in_flight') || 0;
    defaultMetrics.gauge('http_requests_in_flight', Math.max(0, current - 1));
  });

  next();
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const log = req.log || baseLogger;
  log.error('Unhandled request error', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode || 500,
    error: error.message,
    stack: error.stack,
  });

  return res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected server error',
    details: error.details,
  });
}

module.exports = {
  asyncHandler,
  requireFields,
  errorMiddleware,
  isBlankString,
  requestIdMiddleware,
  metricsMiddleware,
  baseLogger,
};
