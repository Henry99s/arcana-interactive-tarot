# Arcana — Interactive Tarot

**Web Application Development — End-Module Assessment**
<br>Henrique Simoura de Almeida <br>
CertHE Computer Science, University of Essex Online

A data-driven web application with a relational backend, authenticated user
accounts and server-side security controls. Built on Node.js with Express and
SQLite.

---

## Requirements

Node.js version 22 or later. Developed and tested on Node.js v24.13.0. The
`better-sqlite3` package requires Node 22 or above and will refuse to install
on earlier versions.

No database server is needed. SQLite stores the entire database in a single
file, which is included in this repository.

## How to run

```
npm install
npm start
```

Then open <http://localhost:3000> in a web browser.

The database at `db/arcana.db` is supplied already populated, so there is no
setup step before starting.

## Signing in

An account can be created on the Account page. A test account is also
included:

| Username | Password |
| --- | --- |
| `henry` | `tarot-cards-2026` |

Saved readings belong to the account that created them, so a reading is only
visible to its owner.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the web server |
| `npm run db:init` | Create the database and apply the schema |
| `npm run db:seed` | Insert the reference data (cards and spreads) |
| `npm run db:verify` | List the tables and indexes that exist |

To rebuild the database from scratch, delete `db/arcana.db` and run `db:init`
followed by `db:seed`.

## Folder structure

```
schema.sql            Data definition language for all six tables
server.js             Entry point; starts the HTTP server

db/
  arcana.db           The SQLite database file
  connection.js       The shared database connection
  init.js             Applies schema.sql
  seed.js             Inserts the cards, spreads and positions
  verify.js           Reports the objects present in the database

server/
  app.js              Assembles the Express application
  middleware/
    session.js        Session configuration
    requireAuth.js    Rejects unauthenticated requests
  repositories/
    userRepository.js     Database access for accounts
    readingRepository.js  Database access for saved readings
  routes/
    authRoutes.js     Registration, sign in, sign out
    readingRoutes.js  Create, read, update and delete readings
  services/
    passwordService.js  Password derivation and verification
  validation/
    userValidation.js     Rules for account data
    readingValidation.js  Rules for saved readings

public/               Everything served to the browser
  index.html          Home page
  reading.html        Card reading and saved readings
  about.html          Information about tarot
  account.html        Sign in and registration
  css/style.css       All styling
  js/
    cards.js          Card and spread data used by the client
    api.js            Wrapper around the server API
    account.js        Account page behaviour
    reading.js        Reading page behaviour
    nav.js            Mobile navigation menu
```

## Database

Six tables, normalised to third normal form:

| Table | Contents |
| --- | --- |
| `cards` | The 22 Major Arcana |
| `spreads` | The four available spreads |
| `positions` | The positions belonging to each spread |
| `users` | Accounts |
| `readings` | A saved reading |
| `reading_cards` | Which card fell in which position |

Foreign keys, `NOT NULL` and `UNIQUE` constraints are declared in `schema.sql`
and enforced by the database on every write. Two indexes are declared, each
serving a query the application performs: readings by user, and cards by
reading.

## Notes on security

- Passwords are stored as scrypt digests with a per-password salt, and are
  never held in a recoverable form.
- Every SQL statement is parameterised; no query is assembled by string
  concatenation.
- Saved readings are scoped to the signed-in user within the SQL statements
  themselves, so supplying another account's identifier returns nothing.
- Values written by users are rendered with `textContent` rather than
  `innerHTML`, so submitted markup is displayed rather than executed.
- Session identifiers are regenerated on sign in and on registration, and the
  session cookie is `HttpOnly` and `SameSite=Strict`.
- The `Secure` cookie attribute is enabled only outside development, since the
  assessed build is served over plain HTTP on localhost.

---

Submitted for academic assessment. The reasoning behind each design and
security decision, including the controls deliberately left out of scope, is
set out in the accompanying technical report.
