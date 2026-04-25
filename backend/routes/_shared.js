function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function requireFields(fields = []) {
  return (req, res, next) => {
    const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  return res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected server error',
    details: error.details,
  });
}

module.exports = {
  asyncHandler,
  requireFields,
  errorMiddleware,
};
