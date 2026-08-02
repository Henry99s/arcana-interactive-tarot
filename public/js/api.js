// api.js — a thin wrapper around the server API.
//
// Every request passes through here so that credential handling and error
// shaping are defined once rather than repeated at each call site.
(function () {
  'use strict';

  window.Arcana = window.Arcana || {};

  async function request(path, options) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      // Instructs the browser to send the session cookie, which it
      // otherwise withholds from requests issued by script.
      credentials: 'same-origin',
      ...options
    });

    let payload = {};

    // A response may carry no body, or a body that is not valid JSON, so
    // parsing is attempted rather than assumed.
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      // The server sends an array of messages; they are joined into one
      // string so callers have a single value to display.
      const messages = payload.errors || ['Something went wrong.'];
      throw new Error(messages.join(' '));
    }

    return payload;
  }

  window.Arcana.api = {
    register: (data) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (data) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    logout: () => request('/api/auth/logout', { method: 'POST' }),

    currentUser: () => request('/api/auth/me'),

    listReadings: () => request('/api/readings'),

    saveReading: (data) =>
      request('/api/readings', { method: 'POST', body: JSON.stringify(data) }),

    updateReading: (id, data) =>
      request(`/api/readings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    deleteReading: (id) => request(`/api/readings/${id}`, { method: 'DELETE' })
  };
})();