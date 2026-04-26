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
  isBlankString,
};
