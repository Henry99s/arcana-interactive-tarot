/**
 * readingRepository.js — all database access concerning saved readings.
 *
 * A reading is stored across two tables: the reading itself and one row
 * per drawn card. Keeping that structure behind this layer means callers
 * work with whole readings and never with the join that assembles them
 * (Parnas, 1972).
 */
const db = require('../../db/connection');

const insertReading = db.prepare(
  'INSERT INTO readings (user_id, spread_id, title, note) VALUES (?, ?, ?, ?)'
);

const insertReadingCard = db.prepare(
  'INSERT INTO reading_cards (reading_id, card_id, position_id) VALUES (?, ?, ?)'
);

// Readings are listed most recent first. The user_id filter is served by
// idx_readings_user_id, which exists precisely because this query runs
// whenever the history is opened.
const selectByUser = db.prepare(
  `SELECT
     readings.id,
     readings.title,
     readings.note,
     readings.created_at,
     spreads.name AS spread_name,
     spreads.code AS spread_code
   FROM readings
   JOIN spreads ON spreads.id = readings.spread_id
   WHERE readings.user_id = ?
   ORDER BY readings.created_at DESC, readings.id DESC`
);

// The cards of one reading, gathered across three tables and returned in
// the order the positions occupy within the spread.
const selectCardsForReading = db.prepare(
  `SELECT
     cards.number,
     cards.name,
     cards.meaning,
     positions.name AS position_name,
     positions.position_index
   FROM reading_cards
   JOIN cards ON cards.id = reading_cards.card_id
   JOIN positions ON positions.id = reading_cards.position_id
   WHERE reading_cards.reading_id = ?
   ORDER BY positions.position_index`
);

// Every statement below is filtered by user_id as well as by id. Ownership
// is enforced in the query itself, so a request cannot reach another
// account's reading by supplying its identifier (OWASP, 2025e).
const selectByIdForUser = db.prepare(
  `SELECT id, title, note, created_at, spread_id
   FROM readings
   WHERE id = ? AND user_id = ?`
);

const updateReading = db.prepare(
  'UPDATE readings SET title = ?, note = ? WHERE id = ? AND user_id = ?'
);

const deleteReading = db.prepare('DELETE FROM readings WHERE id = ? AND user_id = ?');

const selectSpreadByCode = db.prepare('SELECT id FROM spreads WHERE code = ?');

const selectPositionsForSpread = db.prepare(
  'SELECT id, position_index FROM positions WHERE spread_id = ? ORDER BY position_index'
);

const selectCardByName = db.prepare('SELECT id FROM cards WHERE name = ?');

/**
 * Saves a reading and its drawn cards.
 *
 * The two tables are written inside one transaction: a reading stored
 * without its cards would be meaningless, so either both succeed or
 * neither is committed (Haerder and Reuter, 1983).
 */
const create = db.transaction((userId, spreadId, title, note, drawnCards) => {
  const result = insertReading.run(userId, spreadId, title, note);
  const readingId = result.lastInsertRowid;

  drawnCards.forEach(({ cardId, positionId }) => {
    insertReadingCard.run(readingId, cardId, positionId);
  });

  return readingId;
});

function findAllForUser(userId) {
  const readings = selectByUser.all(userId);

  return readings.map((reading) => ({
    ...reading,
    cards: selectCardsForReading.all(reading.id)
  }));
}

function findByIdForUser(readingId, userId) {
  const reading = selectByIdForUser.get(readingId, userId);

  if (!reading) {
    return undefined;
  }

  return { ...reading, cards: selectCardsForReading.all(reading.id) };
}

function update(readingId, userId, title, note) {
  // `changes` reports how many rows the statement altered. Zero means the
  // reading either does not exist or belongs to someone else — the caller
  // is not told which.
  return updateReading.run(title, note, readingId, userId).changes > 0;
}

function remove(readingId, userId) {
  // The dependent reading_cards rows are removed by the ON DELETE CASCADE
  // declared on the foreign key, so the database maintains its own
  // referential integrity rather than relying on the application.
  return deleteReading.run(readingId, userId).changes > 0;
}

function findSpreadByCode(code) {
  return selectSpreadByCode.get(code);
}

function findPositionsForSpread(spreadId) {
  return selectPositionsForSpread.all(spreadId);
}

function findCardByName(name) {
  return selectCardByName.get(name);
}

module.exports = {
  create,
  findAllForUser,
  findByIdForUser,
  update,
  remove,
  findSpreadByCode,
  findPositionsForSpread,
  findCardByName
};