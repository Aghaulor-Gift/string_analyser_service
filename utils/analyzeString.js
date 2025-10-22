const crypto = require('crypto');

// Compute SHA-256 hash of a string
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Analyze a string and return its computed properties
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

function parseBooleanParam(val) {
  if (val === undefined) return undefined;
  if (typeof val !== 'string') return undefined;
  const lower = val.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  return undefined;
}

module.exports = { sha256, analyzeStringValue, parseBooleanParam };
