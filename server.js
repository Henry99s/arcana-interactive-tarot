/**
 * server.js — application entry point.
 *
 * Starts the HTTP server. Keeping this separate from app.js means the
 * application can be loaded without binding a port.
 *
 * Usage: node server.js
 */
const app = require('./server/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Arcana running at http://localhost:${PORT}`);
});