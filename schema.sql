PRAGMA foreign_keys = ON;

CREATE TABLE cards (
    id          INTEGER PRIMARY KEY,
    number      TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL UNIQUE,
    meaning     TEXT NOT NULL
);

CREATE TABLE spreads (
    id              INTEGER PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    combined_text   TEXT NOT NULL
);

CREATE TABLE positions (
    id              INTEGER PRIMARY KEY,
    spread_id       INTEGER NOT NULL,
    position_index  INTEGER NOT NULL,
    name            TEXT NOT NULL,
    FOREIGN KEY (spread_id) REFERENCES spreads(id) ON DELETE CASCADE, 
    UNIQUE (spread_id, position_index)
);

CREATE TABLE users (
    id              INTEGER PRIMARY KEY,
    username        TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE readings (
    id              INTEGER PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    spread_id       INTEGER NOT NULL,
    title           TEXT NOT NULL,
    note            TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spread_id) REFERENCES spreads(id) ON DELETE RESTRICT
);

CREATE TABLE reading_cards (
    id              INTEGER PRIMARY KEY,
    reading_id      INTEGER NOT NULL,
    card_id         INTEGER NOT NULL,
    position_id     INTEGER NOT NULL,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE RESTRICT,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,
    UNIQUE (reading_id, position_id)
);

CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_reading_cards_reading_id ON reading_cards(reading_id);