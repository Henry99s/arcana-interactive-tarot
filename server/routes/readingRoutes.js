/**
 * readingRoutes.js — create, read, update and delete saved readings.
 *
 * Every route here is protected: the router applies requireAuth to all of
 * its paths, and each query is additionally scoped to the session's user,
 * so authorisation does not rest on the guard alone.
 */
const express = require('express');

const readingRepository = require('../repositories/readingRepository');
const requireAuth = require('../middleware/requireAuth');
const {
  validateReadingDetails,
  validateDrawnCards,
  parseIdentifier
} = require('../validation/readingValidation');

const router = express.Router();

// Applied to every route defined below rather than repeated in each one.
router.use(requireAuth);

/**
 * GET /api/readings — lists the signed-in user's readings.
 */
router.get('/', (req, res, next) => {
  try {
    const readings = readingRepository.findAllForUser(req.session.userId);
    return res.json({ readings });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/readings/:id — retrieves one reading.
 */
router.get('/:id', (req, res, next) => {
  try {
    const readingId = parseIdentifier(req.params.id);

    if (!readingId) {
      return res.status(400).json({ errors: ['Invalid reading identifier.'] });
    }

    const reading = readingRepository.findByIdForUser(readingId, req.session.userId);

    // A reading belonging to another account produces the same response as
    // one that does not exist, so the identifiers in use are not revealed.
    if (!reading) {
      return res.status(404).json({ errors: ['Reading not found.'] });
    }

    return res.json({ reading });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/readings — saves a new reading.
 */
router.post('/', (req, res, next) => {
  try {
    const { spreadCode, title, note, drawnCards } = req.body;

    const errors = [
      ...validateReadingDetails({ title, note }),
      ...validateDrawnCards(drawnCards)
    ];

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // The spread code is checked against the spreads table rather than a
    // list held in code: the database is the authority on which spreads
    // exist, and the lookup doubles as an allowlist (OWASP, 2025d).
    const spread = readingRepository.findSpreadByCode(spreadCode);

    if (!spread) {
      return res.status(400).json({ errors: ['Unknown spread.'] });
    }

    const positions = readingRepository.findPositionsForSpread(spread.id);

    // A reading must fill exactly the positions its spread defines.
    if (positions.length !== drawnCards.length) {
      return res.status(400).json({
        errors: [`This spread requires exactly ${positions.length} cards.`]
      });
    }

    // Card names are resolved to identifiers here. Storing the identifier
    // rather than the name is what keeps the card text in one place, so a
    // correction to a meaning applies to every reading that drew it.
    const resolvedCards = [];

    for (let index = 0; index < drawnCards.length; index += 1) {
      const card = readingRepository.findCardByName(drawnCards[index]);

      if (!card) {
        return res.status(400).json({ errors: ['Unknown card in the submitted reading.'] });
      }

      resolvedCards.push({ cardId: card.id, positionId: positions[index].id });
    }

    const readingId = readingRepository.create(
      req.session.userId,
      spread.id,
      title.trim(),
      note ? note.trim() : null,
      resolvedCards
    );

    const reading = readingRepository.findByIdForUser(readingId, req.session.userId);

    return res.status(201).json({ reading });
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/readings/:id — updates the title and note of a reading.
 */
router.put('/:id', (req, res, next) => {
  try {
    const readingId = parseIdentifier(req.params.id);

    if (!readingId) {
      return res.status(400).json({ errors: ['Invalid reading identifier.'] });
    }

    const { title, note } = req.body;

    const errors = validateReadingDetails({ title, note });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // The statement is scoped to the session's user, so an attempt on
    // another account's reading alters nothing and is reported as absent.
    const wasUpdated = readingRepository.update(
      readingId,
      req.session.userId,
      title.trim(),
      note ? note.trim() : null
    );

    if (!wasUpdated) {
      return res.status(404).json({ errors: ['Reading not found.'] });
    }

    const reading = readingRepository.findByIdForUser(readingId, req.session.userId);

    return res.json({ reading });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/readings/:id — removes a reading.
 */
router.delete('/:id', (req, res, next) => {
  try {
    const readingId = parseIdentifier(req.params.id);

    if (!readingId) {
      return res.status(400).json({ errors: ['Invalid reading identifier.'] });
    }

    const wasDeleted = readingRepository.remove(readingId, req.session.userId);

    if (!wasDeleted) {
      return res.status(404).json({ errors: ['Reading not found.'] });
    }

    return res.json({ message: 'Reading deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;