/**
 * app.js — assembles the Express application.
 *
 * This module only wires the application together: it applies middleware,
 * mounts routes and serves static files. It contains no business logic and
 * does not start the server, which keeps configuration separate from both
 * the domain rules and the runtime environment (Parnas, 1972).
 */
const path = require('path');
const express = require('express');
const sessionMiddleware = require('./middleware/session');
const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');

const app = express();

// Parses JSON request bodies into req.body. Without this the server
// receives the raw stream and cannot read submitted values.
app.use(express.json());

// Parses traditional HTML form submissions (application/x-www-form-urlencoded).
app.use(express.urlencoded({ extended: true }));

// Session handling must precede any route that reads req.session.
app.use(sessionMiddleware);

// Mounted before the static handler so API paths are never mistaken for
// file requests.
app.use('/api/auth', authRoutes);

// Saved readings. Every route within this router requires an authenticated
// session, which the router applies to itself rather than leaving to each
// individual handler.
app.use('/api/readings', readingRoutes);

// Health check, used to confirm the server is running. Declared with the
// other API routes so no static file can shadow it.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serves the client-side files. Only the contents of public/ are exposed,
// so server code and the database file remain outside the web root.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Requests that match no route are answered with a generic response.
// API paths receive JSON so the client can handle them consistently.
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).send('Not found');
  }
});

// Central error handler. Express identifies it by its four parameters,
// so `next` must be declared even though it is unused.
app.use((error, req, res, next) => {
  // A malformed request body is a client error, not a server failure, and
  // is reported as such rather than being reduced to a generic 500.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ errors: ['Request body is not valid JSON.'] });
  }

  // Anything else is logged in full for diagnosis while the client
  // receives a generic message, so internal paths, versions and stack
  // traces are never disclosed (OWASP, 2025e).
  console.error(error);
  return res.status(500).json({ error: 'An unexpected error occurred' });
});

module.exports = app;