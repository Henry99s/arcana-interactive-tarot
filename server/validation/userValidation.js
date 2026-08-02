/**
 * userValidation.js — validation rules for account data.
 *
 * These checks run on the server. Equivalent checks in the browser exist
 * for usability only: the client environment is under the user's control,
 * so anything enforced solely there can be bypassed by issuing the request
 * directly (OWASP, 2025d).
 */

// Constraints are defined as an allowlist: what is permitted is stated
// explicitly and everything else is refused. Enumerating what to reject
// is unreliable, since malicious input cannot be exhaustively listed
// (Saltzer and Schroeder, 1975).
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_MAX_LENGTH = 254;

// The minimum length follows NIST SP 800-63B-4, which requires verifiers
// to accept passwords of at least 8 characters and to permit long ones.
// Composition rules (mandatory symbols, mixed case) are deliberately not
// imposed: the same guidance withdrew them, as they push users towards
// predictable substitutions without improving strength
// (Temoshok et al., 2025).
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Validates registration input.
 * Returns an array of messages, empty when the input is acceptable.
 */
function validateRegistration({ username, email, password }) {
  const errors = [];

  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
    errors.push(
      'Username must be 3 to 30 characters and may contain only letters, numbers, hyphens and underscores.'
    );
  }

  if (
    typeof email !== 'string' ||
    email.length > EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.push('A valid email address is required.');
  }

  if (
    typeof password !== 'string' ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    errors.push(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
    );
  }

  return errors;
}

/**
 * Validates login input.
 * Only presence and type are checked: applying the registration rules here
 * would reveal, through the error message, whether a submitted value could
 * possibly correspond to an existing account.
 */
function validateLogin({ username, password }) {
  const errors = [];

  if (typeof username !== 'string' || username.length === 0) {
    errors.push('Username is required.');
  }

  if (typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  return errors;
}

module.exports = { validateRegistration, validateLogin };