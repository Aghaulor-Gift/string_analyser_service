const { sha256, analyzeStringValue, parseBooleanParam } = require('../utils/analyzeString');

// In-memory store: keyed by sha256 hash
// record shape:
// {
//   id: sha256_hash,
//   value: "original string",
//   properties: { length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map },
//   created_at: "ISO timestamp"
// }
const store = {};

/* ---- POST /strings ---- */
function createString(req, res) {
  if (!req.body || !Object.prototype.hasOwnProperty.call(req.body, 'value')) {
    return res.status(400).json({ error: 'Invalid request body or missing "value" field' });
  }

  const { value } = req.body;
  if (typeof value !== 'string') {
    return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
  }

  const properties = analyzeStringValue(value);
  const id = properties.sha256_hash;

  if (store[id]) {
    return res.status(409).json({ error: 'String already exists in the system' });
  }

  const created_at = new Date().toISOString();
  const record = { id, value, properties, created_at };
  store[id] = record;

  return res.status(201).json(record);
}

/* ---- GET /strings/:string_value ---- */
function getString(req, res) {
  const raw = req.params.string_value;
  const value = decodeURIComponent(raw);

  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'Invalid string value in path' });
  }

  const id = sha256(value);
  const record = store[id];

  if (!record) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  return res.status(200).json(record);
}

/* ---- GET /strings with filtering ---- */
function getAllStrings(req, res) {
  try {
    const q = req.query;
    const filters = {};

    if (q.is_palindrome !== undefined) {
      const boolVal = parseBooleanParam(q.is_palindrome);
      if (boolVal === undefined) {
        return res.status(400).json({ error: 'Invalid query parameter "is_palindrome" (must be true or false)' });
      }
      filters.is_palindrome = boolVal;
    }

    if (q.min_length !== undefined) {
      const n = parseInt(q.min_length, 10);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ error: 'Invalid query parameter "min_length" (must be non-negative integer)' });
      }
      filters.min_length = n;
    }

    if (q.max_length !== undefined) {
      const n = parseInt(q.max_length, 10);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ error: 'Invalid query parameter "max_length" (must be non-negative integer)' });
      }
      filters.max_length = n;
    }

    if (q.word_count !== undefined) {
      const n = parseInt(q.word_count, 10);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ error: 'Invalid query parameter "word_count" (must be non-negative integer)' });
      }
      filters.word_count = n;
    }

    if (q.contains_character !== undefined) {
      const cc = q.contains_character;
      if (typeof cc !== 'string' || cc.length !== 1) {
        return res.status(400).json({ error: 'Invalid query parameter "contains_character" (must be a single character)' });
      }
      filters.contains_character = cc;
    }

    if (filters.min_length !== undefined && filters.max_length !== undefined) {
      if (filters.min_length > filters.max_length) {
        return res.status(400).json({ error: '"min_length" cannot be greater than "max_length"' });
      }
    }

    let results = Object.values(store);

    if (filters.is_palindrome !== undefined) {
      results = results.filter(r => r.properties.is_palindrome === filters.is_palindrome);
    }
    if (filters.min_length !== undefined) {
      results = results.filter(r => r.properties.length >= filters.min_length);
    }
    if (filters.max_length !== undefined) {
      results = results.filter(r => r.properties.length <= filters.max_length);
    }
    if (filters.word_count !== undefined) {
      results = results.filter(r => r.properties.word_count === filters.word_count);
    }
    if (filters.contains_character !== undefined) {
      results = results.filter(r => Object.prototype.hasOwnProperty.call(r.properties.character_frequency_map, filters.contains_character));
    }

    const filtersApplied = {};
    if (filters.is_palindrome !== undefined) filtersApplied.is_palindrome = filters.is_palindrome;
    if (filters.min_length !== undefined) filtersApplied.min_length = filters.min_length;
    if (filters.max_length !== undefined) filtersApplied.max_length = filters.max_length;
    if (filters.word_count !== undefined) filtersApplied.word_count = filters.word_count;
    if (filters.contains_character !== undefined) filtersApplied.contains_character = filters.contains_character;

    return res.status(200).json({ data: results, count: results.length, filters_applied: filtersApplied });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

/* ---- DELETE /strings/:string_value ---- */
function deleteString(req, res) {
  const raw = req.params.string_value;
  const value = decodeURIComponent(raw);

  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'Invalid string value in path' });
  }

  const id = sha256(value);
  if (!store[id]) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  delete store[id];
  return res.status(204).send();
}

module.exports = { createString, getString, getAllStrings, deleteString, _store: store };