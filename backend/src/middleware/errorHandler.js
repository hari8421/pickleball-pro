/**
 * Central error-handling middleware.
 * Must be registered LAST (after all routes and other middleware).
 * Express identifies it as an error handler because it has 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't leak stack traces in production
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(status).json({
    error: message,
    ...(stack && { stack }),
  });
};
