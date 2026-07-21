const { validationResult } = require('express-validator');

/**
 * Reads the result of preceding express-validator chains.
 * Returns 422 with the full error array if any field failed validation.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
