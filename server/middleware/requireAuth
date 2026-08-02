/**
 * requireAuth.js — refuses requests that carry no authenticated session.
 *
 * Applying this as middleware rather than checking inside each handler
 * means the guard cannot be omitted when a route is added: every request
 * to a protected path passes through it (Saltzer and Schroeder, 1975).
 */

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ errors: ['Authentication required.'] });
  }

  return next();
}

module.exports = requireAuth;