// reading.js — the card reading page.
//
// Readings are drawn in the browser and persisted through the server API.
// The history that was previously held in localStorage is now stored in
// the database, so it belongs to an account rather than to a browser.
(function () {
  'use strict';

  const api = window.Arcana.api;
  const cards = window.Arcana.cards;
  const spreads = window.Arcana.spreads;

  // ===== Page elements =====
  const spreadButtons = document.querySelectorAll('.spread-card');
  const revealButton = document.getElementById('btn-reveal');
  const validationMsg = document.getElementById('validation-msg');

  const stepChoose = document.getElementById('step-choose');
  const stepReading = document.getElementById('step-reading');

  const readingTitle = document.getElementById('reading-title');
  const readingDesc = document.getElementById('reading-description');
  const cardsGrid = document.getElementById('cards-grid');
  const meaningsBox = document.getElementById('card-meanings');
  const combinedBox = document.getElementById('combined-meaning');

  const saveForm = document.getElementById('save-form');
  const saveTitle = document.getElementById('save-title');
  const saveNote = document.getElementById('save-note');
  const saveMessage = document.getElementById('save-message');
  const newButton = document.getElementById('btn-new');

  const historyList = document.getElementById('history-list');
  const historyMessage = document.getElementById('history-message');

  const state = {
    chosenSpread: null,
    drawnCards: [],
    signedIn: false
  };

  // =======================================================
  // Element construction
  //
  // Nodes are built with createElement and their text assigned through
  // textContent, which does not parse markup. The previous version
  // concatenated values into innerHTML; once titles and notes are written
  // by users and returned from the database, that same path would execute
  // whatever markup those values contained (OWASP, 2025c).
  // =======================================================

  function createElementWithText(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (text !== undefined && text !== null) {
      element.textContent = text;
    }

    return element;
  }

  // Removes every child of a node. Used in place of innerHTML = '' so that
  // no markup is ever assigned, even an empty string.
  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  // =======================================================
  // Step 1 — choosing a spread
  // =======================================================

  spreadButtons.forEach((button) => {
    button.addEventListener('click', () => {
      spreadButtons.forEach((other) => other.setAttribute('aria-pressed', 'false'));

      button.setAttribute('aria-pressed', 'true');
      state.chosenSpread = button.dataset.spread;

      revealButton.disabled = false;
      validationMsg.textContent =
        `Spread selected: ${spreads[state.chosenSpread].name}. Click to reveal.`;
    });
  });

  revealButton.addEventListener('click', () => {
    // Client-side validation, retained for usability. The server performs
    // its own checks, since anything enforced only here can be bypassed.
    if (state.chosenSpread === null) {
      validationMsg.textContent = 'Please select a spread first.';
      return;
    }

    startReading();
  });

  // =======================================================
  // Step 2 — drawing and revealing
  // =======================================================

  function startReading() {
    const spread = spreads[state.chosenSpread];

    state.drawnCards = drawRandomCards(spread.positions.length);

    readingTitle.textContent = `Spread: ${spread.name}`;
    readingDesc.textContent = spread.description;

    clearElement(cardsGrid);
    clearElement(meaningsBox);
    clearElement(combinedBox);

    saveMessage.textContent = '';
    saveForm.reset();

    state.drawnCards.forEach((card, index) => {
      const position = spread.positions[index];
      addCardToPage(card, position, index);
      addMeaningToPage(card, position);
    });

    // A default title saves the user from composing one, while remaining
    // editable before submission.
    saveTitle.value = `${spread.name} — ${new Date().toLocaleDateString('en-GB')}`;

    stepChoose.classList.add('hidden');
    stepReading.classList.remove('hidden');
    stepReading.scrollIntoView({ behavior: 'smooth' });
  }

  function drawRandomCards(howMany) {
    const copy = cards.slice();
    copy.sort(() => Math.random() - 0.5);
    return copy.slice(0, howMany);
  }

  function addCardToPage(card, position, index) {
    // A button rather than a div, so the card is reachable by keyboard and
    // announced correctly by assistive technology WCAG 2.1.1 (W3C, 2018).
    const cardElement = document.createElement('button');
    cardElement.className = 'card';
    cardElement.type = 'button';
    cardElement.setAttribute(
      'aria-label',
      `Reveal card ${index + 1}, ${position} position`
    );

    const inner = createElementWithText('span', 'card-inner');

    const back = createElementWithText('span', 'card-face card-back');
    back.appendChild(createElementWithText('span', null, '✦'));
    back.appendChild(createElementWithText('span', 'card-hint', 'click to reveal'));

    const front = createElementWithText('span', 'card-face card-front');
    front.appendChild(createElementWithText('span', 'card-number', card.number));
    front.appendChild(createElementWithText('span', 'card-name', card.name));
    front.appendChild(createElementWithText('span', 'card-position', position));

    inner.appendChild(back);
    inner.appendChild(front);
    cardElement.appendChild(inner);

    cardElement.addEventListener('click', () => flipCard(cardElement, index));

    cardsGrid.appendChild(cardElement);
  }

  function flipCard(cardElement, index) {
    if (cardElement.classList.contains('flipped')) {
      return;
    }

    // The optimisation hint is applied for the duration of the animation
    // only, as leaving it in place is discouraged.
    cardElement.style.willChange = 'transform';
    cardElement.classList.add('flipped');

    setTimeout(() => {
      cardElement.style.willChange = 'auto';
    }, 800);

    showMeaning(index);
  }

  function addMeaningToPage(card, position) {
    const meaning = createElementWithText('div', 'meaning hidden');
    meaning.appendChild(
      createElementWithText('h4', null, `${position} — ${card.name}`)
    );
    meaning.appendChild(createElementWithText('p', null, card.meaning));
    meaningsBox.appendChild(meaning);
  }

  function showMeaning(index) {
    const allMeanings = meaningsBox.querySelectorAll('.meaning');
    allMeanings[index].classList.remove('hidden');

    const flippedCards = document.querySelectorAll('.card.flipped');

    if (flippedCards.length === state.drawnCards.length) {
      showCombinedMeaning();
    }
  }

  function showCombinedMeaning() {
    const spread = spreads[state.chosenSpread];

    clearElement(combinedBox);
    combinedBox.appendChild(
      createElementWithText('h3', null, 'How to read this spread together')
    );
    combinedBox.appendChild(createElementWithText('p', null, spread.combined));
  }

  // =======================================================
  // Saving  (INSERT)
  // =======================================================

  saveForm.addEventListener('submit', async (event) => {
    // Prevents the browser reloading the page, which would discard the
    // server's response.
    event.preventDefault();
    saveMessage.textContent = '';

    if (state.drawnCards.length === 0) {
      saveMessage.textContent = 'Draw a reading before saving.';
      return;
    }

    try {
      await api.saveReading({
        spreadCode: state.chosenSpread,
        title: saveTitle.value,
        note: saveNote.value,
        // Card names are sent rather than identifiers; the server resolves
        // them against the cards table, so an unknown name is rejected.
        drawnCards: state.drawnCards.map((card) => card.name)
      });

      saveMessage.textContent = '✦ Reading saved.';
      await loadHistory();
    } catch (error) {
      saveMessage.textContent = error.message;
    }
  });

  newButton.addEventListener('click', () => {
    stepReading.classList.add('hidden');
    stepChoose.classList.remove('hidden');

    spreadButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));

    state.chosenSpread = null;
    state.drawnCards = [];
    revealButton.disabled = true;
    validationMsg.textContent = 'Select a spread to continue.';

    stepChoose.scrollIntoView({ behavior: 'smooth' });
  });

  // =======================================================
  // History  (SELECT, UPDATE, DELETE)
  // =======================================================

  async function loadHistory() {
    clearElement(historyList);

    if (!state.signedIn) {
      historyMessage.textContent = 'Sign in to save readings and view your history.';
      return;
    }

    try {
      const { readings } = await api.listReadings();

      if (readings.length === 0) {
        historyMessage.textContent = 'No readings saved yet.';
        return;
      }

      historyMessage.textContent = '';
      readings.forEach((reading) => historyList.appendChild(buildHistoryItem(reading)));
    } catch (error) {
      historyMessage.textContent = error.message;
    }
  }

  function buildHistoryItem(reading) {
    const item = createElementWithText('div', 'history-item');

    const details = createElementWithText('div', 'history-details');
    details.appendChild(createElementWithText('p', 'history-spread', reading.title));
    details.appendChild(
      createElementWithText('p', 'history-cards', reading.spread_name)
    );

    // Card names are joined for display only; each value is still inserted
    // as text rather than markup.
    const cardNames = reading.cards.map((card) => card.name).join(' · ');
    details.appendChild(createElementWithText('p', 'history-cards', cardNames));

    if (reading.note) {
      details.appendChild(createElementWithText('p', 'history-note', reading.note));
    }

    details.appendChild(
      createElementWithText('span', 'history-date', reading.created_at)
    );

    const actions = createElementWithText('div', 'history-actions');

    const renameButton = createElementWithText('button', 'btn-ghost', 'Edit');
    renameButton.type = 'button';
    renameButton.addEventListener('click', () => editReading(reading));

    const deleteButton = createElementWithText('button', 'btn-ghost', 'Delete');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => removeReading(reading));

    actions.appendChild(renameButton);
    actions.appendChild(deleteButton);

    item.appendChild(details);
    item.appendChild(actions);

    return item;
  }

  async function editReading(reading) {
    const title = window.prompt('Title for this reading:', reading.title);

    if (title === null) {
      return;
    }

    const note = window.prompt('Note (optional):', reading.note || '');

    if (note === null) {
      return;
    }

    try {
      await api.updateReading(reading.id, { title, note });
      await loadHistory();
    } catch (error) {
      historyMessage.textContent = error.message;
    }
  }

  async function removeReading(reading) {
    const confirmed = window.confirm(`Delete "${reading.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteReading(reading.id);
      await loadHistory();
    } catch (error) {
      historyMessage.textContent = error.message;
    }
  }

  // =======================================================
  // Start-up
  // =======================================================

  async function initialise() {
    try {
      const { user } = await api.currentUser();
      state.signedIn = Boolean(user);
    } catch (error) {
      state.signedIn = false;
    }

    // The save form is only offered to signed-in users; the server rejects
    // the request regardless, so this is presentation rather than control.
    if (!state.signedIn) {
      saveForm.classList.add('hidden');
    }

    await loadHistory();
  }

  initialise();
})();