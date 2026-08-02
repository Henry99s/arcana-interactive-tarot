// cards.js — the card data and spread settings
// This file only holds data. The reading.js file uses it.
//
// We attach the data to a single shared object called "Arcana".
// This lets the other scripts read it without using ES Module
// import/export, so the site works when opened directly from a
// file (file://) without needing a local server.
window.Arcana = window.Arcana || {};

// The 22 Major Arcana cards, each with a number, name and meaning.
window.Arcana.cards = [
  { number: '0',     name: 'The Fool',          meaning: 'New beginnings, spontaneity, adventure and innocence. A leap of faith into the unknown.' },
  { number: 'I',     name: 'The Magician',      meaning: 'Manifestation, skill and willpower. You have the resources you need — now is the time to act.' },
  { number: 'II',    name: 'The High Priestess', meaning: 'Intuition, inner wisdom and mystery. What is hidden will be revealed by looking within.' },
  { number: 'III',   name: 'The Empress',       meaning: 'Abundance, nurturing and creativity. Nurture what needs to grow, in you and around you.' },
  { number: 'IV',    name: 'The Emperor',       meaning: 'Structure, authority and stability. Order and boundaries help build something lasting.' },
  { number: 'V',     name: 'The Hierophant',    meaning: 'Tradition, learning and shared beliefs. There is wisdom in established paths.' },
  { number: 'VI',    name: 'The Lovers',        meaning: 'Love, important choices and alignment of values. A decision of the heart sets the course.' },
  { number: 'VII',   name: 'The Chariot',       meaning: 'Determination, control and victory. With focus and will, the path opens — do not stop now.' },
  { number: 'VIII',  name: 'Strength',          meaning: 'Inner courage, patience and compassion. Real strength is gentle and persistent, not forceful.' },
  { number: 'IX',    name: 'The Hermit',        meaning: 'Reflection, solitude and the search within. Step back to find your own answers.' },
  { number: 'X',     name: 'Wheel of Fortune',  meaning: 'Cycles, change and destiny. What rises will fall, and what falls will rise — accept the flow.' },
  { number: 'XI',    name: 'Justice',           meaning: 'Balance, cause and effect, truth. Consequences arrive — did you act with integrity?' },
  { number: 'XII',   name: 'The Hanged Man',    meaning: 'A willing pause and a new perspective. Sometimes you must stop to see from a different angle.' },
  { number: 'XIII',  name: 'Death',             meaning: 'Transformation and the end of a cycle. Something ends so that something new can begin. Do not fear it.' },
  { number: 'XIV',   name: 'Temperance',        meaning: 'Balance, moderation and patience. Blending opposites wisely leads to lasting harmony.' },
  { number: 'XV',    name: 'The Devil',         meaning: 'Attachment, illusion and old habits. What binds you still holds power — recognise the pattern.' },
  { number: 'XVI',   name: 'The Tower',         meaning: 'Sudden change and revelation. What falls was not solid enough. Rebuild on firmer ground.' },
  { number: 'XVII',  name: 'The Star',          meaning: 'Hope, renewal and healing. After the storm, the sky clears — trust the process.' },
  { number: 'XVIII', name: 'The Moon',          meaning: 'Illusion, fear and the unconscious. Not all is as it seems — move slowly and stay calm.' },
  { number: 'XIX',   name: 'The Sun',           meaning: 'Joy, vitality and clarity. The light reveals everything — a moment of genuine flourishing.' },
  { number: 'XX',    name: 'Judgement',         meaning: 'Awakening, reflection and rebirth. You are being called to a higher version of yourself.' },
  { number: 'XXI',   name: 'The World',         meaning: 'Completion, wholeness and achievement. A cycle closes with wisdom. You are whole.' },
];

// The settings for each spread: how many cards and what each position means.
window.Arcana.spreads = {
  one: {
    name: 'Card of the Day',
    positions: ['The Present Moment'],
    description: 'A single card to guide your reflection for the day.',
    combined: 'This card invites you to consider how its theme shows up in your life today. There is no rush — only presence.',
  },
  three: {
    name: 'Past · Present · Future',
    positions: ['Past', 'Present', 'Future'],
    description: 'The classic spread. Three cards reveal the timeline of a situation or question.',
    combined: 'Read the three cards as one continuous story: the past shaped the present, and the present carries the seeds of what is to come. The third card is not a fixed fate — it is a tendency that your present choices can still influence.',
  },
  five: {
    name: 'Simple Cross',
    positions: ['Current Situation', 'Challenge', 'Root / Foundation', 'Advice', 'Possible Outcome'],
    description: 'Five cards that give a fuller view of a situation and its possible paths.',
    combined: 'Begin with the Situation and what crosses it (the Challenge). The Root reveals what supports or complicates everything. The Advice is the energy to take on. The Outcome is not guaranteed — it is what tends to emerge if the current path continues.',
  },
  celtic: {
    name: 'Celtic Cross',
    positions: [
      'Central Situation', 'What Crosses It', 'Root / Foundation', 'Recent Past',
      'Possible Future', 'Near Future', 'Self-Image', 'External Influences',
      'Hopes and Fears', 'Final Outcome'
    ],
    description: 'The most complete spread. Ten cards for a deeper reading of a complex situation.',
    combined: 'The Celtic Cross is a long conversation. The first six cards form the central cross (the immediate situation). The final four reveal the inner journey and the possible arc. The Final Outcome is the furthest from the present — it can and should be influenced by what you do with the other nine cards.',
  },
};
