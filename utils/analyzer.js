const { sha256 } = require('./helpers');

function analyzeString(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Invalid input: value must be a non-empty string');
  }

  const length = value.length;
  const is_palindrome = value.toLowerCase() === value.toLowerCase().split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).length;
  const sha256_hash = sha256(value);

  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

module.exports = { analyzeString };