/**
 * verify.js — confirms that the schema was applied as intended.
 *
 * Reads sqlite_master, the internal catalogue in which SQLite records the
 * definition of every table and index, and reports the state of foreign
 * key enforcement on the connection.
 *
 * Usage: node db/verify.js
 */
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'arcana.db'));

// Objects whose names begin with 'sqlite_' are created and maintained by
// the engine itself, so they are excluded from the report.
const objects = db
  .prepare(
    `SELECT type, name
     FROM sqlite_master
     WHERE name NOT LIKE 'sqlite_%'
     ORDER BY type, name`
  )
  .all();

console.log('Database objects created:\n');
objects.forEach((object) => {
  console.log(`  [${object.type}] ${object.name}`);
});

// Foreign key enforcement is a per-connection setting that the engine
// leaves disabled by default, so it is confirmed at runtime rather than
// assumed from its declaration in the schema.
const foreignKeysEnabled = db.pragma('foreign_keys', { simple: true });
console.log(`\nForeign key enforcement: ${foreignKeysEnabled ? 'ON' : 'OFF'}`);

db.close();