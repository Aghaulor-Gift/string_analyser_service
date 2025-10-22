const crypto = require('crypto');

/**
 * sha256 - compute SHA-256 hex digest of a string
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * analyzeStringValue - compute required properties for a string
 * @param {string} value
 * @returns {object}
 */
function analyzeStringValue(value) {
  const length = value.length;
  const lowered = value.toLowerCase();
  const is_palindrome = lowered === lowered.split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const trimmed = value.trim();
  const word_count = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  const sha = sha256(value);

  const character_frequency_map = {};
  for (const ch of value) {
    character_frequency_map[ch] = (character_frequency_map[ch] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash: sha,
    character_frequency_map
  };
}

/**
 * parseBooleanParam - accepts 'true' or 'false' (case-insensitive)
 * returns boolean or undefined if invalid/absent
 */
function parseBooleanParam(val) {
  if (val === undefined) return undefined;
  if (typeof val !== 'string') return undefined;
  const lower = val.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  return undefined;
}

module.exports = { sha256, analyzeStringValue, parseBooleanParam }