/**
 * passwordService.js — derives and verifies password hashes.
 *
 * Isolating this behind a small interface means the rest of the
 * application never handles a raw password beyond passing it in, and the
 * algorithm can be replaced without touching any calling code
 * (Parnas, 1972).
 */
const crypto = require('crypto');

// scrypt is a memory-hard key derivation function: each guess must
// allocate memory, which removes the advantage that GPUs and dedicated
// hardware hold over general-purpose CPUs. A general-purpose hash such as
// SHA-256 is unsuitable here precisely because it is fast, multiplying the
// attempts an attacker can make per second (OWASP, 2025f).
//
// The parameters follow the values published in the OWASP Password
// Storage Cheat Sheet (2025f). scrypt is used in place of Argon2id, its
// first recommendation, because it is available in the Node standard
// library and therefore adds no dependency requiring native compilation.
const COST_PARAMETERS = {
  N: 2 ** 17, // CPU and memory cost
  r: 8,       // block size
  p: 1        // parallelisation
};

const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

// Node caps scrypt memory at 32 MiB by default, which is below what the
// chosen cost requires (roughly 128 * N * r bytes), so the ceiling is
// raised to match.
const MAX_MEMORY = 256 * 1024 * 1024;

/**
 * Derives a key and returns it with the parameters that produced it.
 * Storing the parameters alongside the hash allows the cost to be raised
 * later without invalidating existing accounts.
 */
function hashPassword(password) {
  // A per-password salt defeats precomputed (rainbow table) attacks and
  // ensures two identical passwords do not produce identical hashes. It
  // is not a secret and is stored beside the digest.
  const salt = crypto.randomBytes(SALT_LENGTH);

  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, {
    ...COST_PARAMETERS,
    maxmem: MAX_MEMORY
  });

  const { N, r, p } = COST_PARAMETERS;

  return [
    'scrypt',
    N,
    r,
    p,
    salt.toString('base64'),
    derivedKey.toString('base64')
  ].join('$');
}

/**
 * Verifies a password against a stored hash.
 * Returns false rather than throwing on a malformed record, so a corrupt
 * row cannot be distinguished from an incorrect password.
 */
function verifyPassword(password, storedHash) {
  const parts = storedHash.split('$');

  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, N, r, p, saltBase64, keyBase64] = parts;

  const salt = Buffer.from(saltBase64, 'base64');
  const expectedKey = Buffer.from(keyBase64, 'base64');

  // The stored parameters are used rather than the current constants, so
  // hashes created under an earlier cost still verify correctly.
  const derivedKey = crypto.scryptSync(password, salt, expectedKey.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY
  });

  // A constant-time comparison prevents the number of matching leading
  // bytes from being inferred from how long the comparison takes.
  return crypto.timingSafeEqual(derivedKey, expectedKey);
}

module.exports = { hashPassword, verifyPassword };