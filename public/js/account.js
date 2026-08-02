// account.js — sign in, registration and session display.
(function () {
  'use strict';

  const api = window.Arcana.api;

  const loading = document.getElementById('account-loading');
  const signedInPanel = document.getElementById('signed-in-panel');
  const signedOutPanel = document.getElementById('signed-out-panel');
  const signedInDetails = document.getElementById('signed-in-details');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');
  const logoutButton = document.getElementById('btn-logout');

  function showSignedIn(user) {
    // textContent is used rather than innerHTML: the username is supplied
    // by the user, and assigning it as text means any markup it contains
    // is displayed rather than parsed (OWASP, 2025c).
    signedInDetails.textContent = `Signed in as ${user.username} (${user.email}).`;

    loading.classList.add('hidden');
    signedOutPanel.classList.add('hidden');
    signedInPanel.classList.remove('hidden');
  }

  function showSignedOut() {
    loading.classList.add('hidden');
    signedInPanel.classList.add('hidden');
    signedOutPanel.classList.remove('hidden');
  }

  async function refreshSession() {
    try {
      const { user } = await api.currentUser();

      if (user) {
        showSignedIn(user);
      } else {
        showSignedOut();
      }
    } catch (error) {
      showSignedOut();
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    // The browser's default submission would reload the page, discarding
    // the response the server sends back.
    event.preventDefault();
    loginMessage.textContent = '';

    try {
      const { user } = await api.login({
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
      });

      loginForm.reset();
      showSignedIn(user);
    } catch (error) {
      // The server returns one message for every authentication failure,
      // so nothing here reveals whether the account exists.
      loginMessage.textContent = error.message;
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    registerMessage.textContent = '';

    try {
      const { user } = await api.register({
        username: document.getElementById('register-username').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value
      });

      registerForm.reset();
      showSignedIn(user);
    } catch (error) {
      registerMessage.textContent = error.message;
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await api.logout();
    } finally {
      // The panel is switched regardless of the outcome, so a failed
      // request cannot leave the page claiming the user is still signed in.
      showSignedOut();
    }
  });

  refreshSession();
})();