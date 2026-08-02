/**
 * userRepository.js — all database access concerning user accounts.
 *
 * Confining SQL to the repository layer means the routes above it deal in
 * plain objects and never in queries, so the storage engine could change
 * without altering the request handling (Parnas, 1972).
 */
const db = require('../../db/connection');

// Statements are prepared once at load. Placeholders keep supplied values
// separate from the statement structure, which is fixed during parsing,
// so input cannot alter the command (OWASP, 2025h).
const insertUser = db.prepare(
  'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
);

const selectByUsername = db.prepare(
  'SELECT id, username, email, password_hash FROM users WHERE username = ?'
);

const selectByEmail = db.prepare(
  'SELECT id, username, email, password_hash FROM users WHERE email = ?'
);

// The password hash is deliberately omitted here: this statement serves
// the session lookup, which has no reason to load the credential.
const selectById = db.prepare(
  'SELECT id, username, email, created_at FROM users WHERE id = ?'
);

function create(username, email, passwordHash) {
  const result = insertUser.run(username, email, passwordHash);
  return result.lastInsertRowid;
}

function findByUsername(username) {
  return selectByUsername.get(username);
}

function findByEmail(email) {
  return selectByEmail.get(email);
}

function findById(id) {
  return selectById.get(id);
}

module.exports = { create, findByUsername, findByEmail, findById };