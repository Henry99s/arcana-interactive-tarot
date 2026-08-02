/**
 * session.js — configures server-side session handling.
 *
 * The cookie carries only an opaque identifier; the session data itself
 * remains on the server, which keeps it out of reach of client-side script
 * and allows a session to be invalidated centrally (Barth, 2011).
 */
const session = require('express-session');

// The secret signs the session cookie so a tampered identifier is
// rejected. It is read from the environment because a credential
// committed to source control is disclosed to everyone with repository
// access; the fallback exists solely to keep local setup workable.
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'development-only-secret-change-me';

const ONE_HOUR = 60 * 60 * 1000;

module.exports = session({
  secret: SESSION_SECRET,
  name: 'arcana.sid',

  // The store is only written to when the session changes, so anonymous
  // visitors do not each cause a session to be created.
  resave: false,
  saveUninitialized: false,

  cookie: {
    // Withholds the cookie from document.cookie, so script injected into
    // the page cannot read the session identifier (OWASP, 2025g).
    httpOnly: true,

    // Restricts the cookie to same-site requests, mitigating cross-site
    // request forgery, which exploits the browser attaching credentials
    // to requests it did not originate (OWASP, 2025b).
    sameSite: 'strict',

    // Transmission over HTTPS only. Enabled outside development, since
    // the assessed build is served over plain HTTP on localhost, where
    // the flag would prevent the cookie being set at all.
    secure: process.env.NODE_ENV === 'production',

    // Idle timeout: the window in which an abandoned session remains
    // usable is bounded rather than open-ended (OWASP, 2025g).
    maxAge: ONE_HOUR
  }
});