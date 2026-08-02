// nav.js — opens and closes the mobile menu
//
// Wrapped in an IIFE (Module Pattern) so its variables stay private
// and do not leak into the global namespace.
(function () {
  'use strict';

  const toggleButton = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // When the hamburger button is clicked, show or hide the menu
  toggleButton.addEventListener('click', function () {
    navLinks.classList.toggle('open');

    // Change the icon between "menu" and "close"
    if (navLinks.classList.contains('open')) {
      toggleButton.textContent = '✕';
    } else {
      toggleButton.textContent = '☰';
    }
  });

})();
