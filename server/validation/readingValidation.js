/**
 * readingValidation.js — validation rules for saved readings.
 */

const TITLE_MAX_LENGTH = 100;
const NOTE_MAX_LENGTH = 2000;

/**
 * Validates the title and optional note.
 * Lengths are bounded so a single field cannot be used to store arbitrary
 * quantities of data.
 */
function validateReadingDetails({ title, note }) {
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('A title is required.');
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.push(`Title must be no longer than ${TITLE_MAX_LENGTH} characters.`);
  }

  // The note is optional, so null and undefined are accepted; anything
  // else must be a string within the permitted length.
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      errors.push('Note must be text.');
    } else if (note.length > NOTE_MAX_LENGTH) {
      errors.push(`Note must be no longer than ${NOTE_MAX_LENGTH} characters.`);
    }
  }

  return errors;
}

/**
 * Validates the drawn cards submitted with a new reading.
 * Only shape is checked here; whether the named cards and the spread
 * actually exist is settled against the database in the route.
 */
function validateDrawnCards(drawnCards) {
  const errors = [];

  if (!Array.isArray(drawnCards) || drawnCards.length === 0) {
    errors.push('At least one drawn card is required.');
    return errors;
  }

  const everyEntryIsACardName = drawnCards.every(
    (name) => typeof name === 'string' && name.length > 0
  );

  if (!everyEntryIsACardName) {
    errors.push('Each drawn card must be identified by name.');
  }

  return errors;
}

/**
 * Converts a route parameter to a positive integer, or undefined.
 * Route parameters arrive as strings, so an identifier is checked rather
 * than passed to the database on trust.
 */
function parseIdentifier(value) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

module.exports = { validateReadingDetails, validateDrawnCards, parseIdentifier };