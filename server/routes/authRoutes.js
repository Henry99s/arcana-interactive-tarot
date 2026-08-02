/**
 * authRoutes.js — registration, login, logout and session enquiry.
 *
 * Routes translate between HTTP and the application: they validate input,
 * call the layers beneath and shape the response. Password derivation
 * belongs to the password service and every query to the repository, so
 * this file contains neither cryptography nor SQL (Parnas, 1972).
 */
const express = require('express');

const userRepository = require('../repositories/userRepository');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { validateRegistration, validateLogin } = require('../validation/userValidation');

const router = express.Router();

// A hash of a value no account can hold. Verifying against it when no user
// is found makes the absent-account path cost the same as the wrong-password
// path, so account existence cannot be inferred from response time
// (OWASP, 2025a).
const DUMMY_HASH = hashPassword(require('crypto').randomBytes(32).toString('hex'));

// A single message for every failure mode. Distinguishing 'no such user'
// from 'wrong password' confirms which accounts exist, which is what makes
// credential stuffing and targeted phishing efficient (OWASP, 2025a).
const LOGIN_FAILURE_MESSAGE = 'Invalid username or password.';

/**
 * POST /api/auth/register — creates an account.
 */
router.post('/register', (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const errors = validateRegistration({ username, email, password });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Checked before insertion so the response can name the conflicting
    // field. The UNIQUE constraints remain the authority: they are
    // enforced on every write regardless of the path taken through the
    // application (Saltzer and Schroeder, 1975).
    if (userRepository.findByUsername(username)) {
      return res.status(409).json({ errors: ['That username is already taken.'] });
    }

    if (userRepository.findByEmail(email)) {
      return res.status(409).json({ errors: ['That email address is already registered.'] });
    }

    const userId = userRepository.create(username, email, hashPassword(password));
    

    // The identifier is replaced here for the same reason as on login:
    // registration is a change of privilege, so any identifier planted in
    // the browser beforehand must cease to be valid (OWASP, 2025g).
    return req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        return next(regenerateError);
      }

      req.session.userId = userId;

      return res.status(201).json({
        user: { id: userId, username, email }
      });
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/auth/login — authenticates and opens a session.
 */
router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;

    const errors = validateLogin({ username, password });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = userRepository.findByUsername(username);

    // The derivation runs even when no account matches. Returning early
    // instead would make the absent-account path measurably faster and
    // disclose which usernames exist (OWASP, 2025a).
    const passwordMatches = user
      ? verifyPassword(password, user.password_hash)
      : verifyPassword(password, DUMMY_HASH);

    if (!user || !passwordMatches) {
      return res.status(401).json({ errors: [LOGIN_FAILURE_MESSAGE] });
    }

    // The identifier is replaced at the point of privilege change. Reusing
    // the pre-authentication identifier would leave any value an attacker
    // had planted in the browser valid for the authenticated session — the
    // session fixation attack (OWASP, 2025g).
    return req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        return next(regenerateError);
      }

      req.session.userId = user.id;

      return res.json({
        user: { id: user.id, username: user.username, email: user.email }
      });
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/auth/logout — ends the session.
 */
router.post('/logout', (req, res, next) => {
  // The session is destroyed on the server, not merely cleared in the
  // browser: removing the cookie alone would leave the identifier usable
  // by anyone who had captured it (OWASP, 2025g).
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('arcana.sid');
    return res.json({ message: 'Signed out.' });
  });
});

/**
 * GET /api/auth/me — reports the current session.
 * Used by the client to decide what to display on load.
 */
router.get('/me', (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    const user = userRepository.findById(req.session.userId);

    // The account may have been deleted while the session was still live,
    // so the session is discarded rather than trusted on its own.
    if (!user) {
      return req.session.destroy(() => res.json({ user: null }));
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;