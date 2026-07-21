/**
 * Catch-all 404 handler.
 * Must be registered AFTER all routes and BEFORE errorHandler.
 */
module.exports = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};
