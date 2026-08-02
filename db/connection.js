/**
 * connection.js — provides the single shared database connection.
 *
 * Centralising the connection means the rest of the application never
 * constructs one itself, so connection settings are defined in exactly
 * one place and cannot drift between modules (Parnas, 1972).
 */
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'arcana.db'));

// SQLite disables foreign key enforcement by default and the setting is
// per connection, so it is asserted explicitly rather than assumed.
// Without it the declared foreign keys would be documentation only.
db.pragma('foreign_keys = ON');

// Write-ahead logging allows reads to proceed during a write, which
// suits a web server handling concurrent requests.
db.pragma('journal_mode = WAL');

module.exports = db;