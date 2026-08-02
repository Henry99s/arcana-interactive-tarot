/**
 * init.js — creates the database file and applies the schema.
 *
 * Structure (DDL) is separated from reference data (DML in seed.js), so
 * the schema can be rebuilt independently of the data it will hold.
 *
 * Usage: node db/init.js
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'arcana.db'));

// The schema lives in a plain .sql file rather than in JavaScript, so the
// data definition language is readable on its own and can be inspected or
// executed by any SQLite client.
const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

try {
  // exec() runs several statements in sequence and is used only for the
  // schema; every statement carrying user data is prepared instead.
  db.exec(schema);
  console.log('Schema applied successfully.');
} catch (error) {
  // The schema creates tables unconditionally, so re-running it against an
  // existing database is rejected. The cause is reported without exposing
  // the underlying stack trace.
  if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
    console.error(
      'Database already initialised. Delete db/arcana.db to rebuild it.'
    );
  } else {
    console.error('Schema could not be applied:', error.message);
  }
  process.exitCode = 1;
}

db.close();