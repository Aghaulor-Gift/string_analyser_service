const { sha256, analyzeStringValue, parseBooleanParam } = require('../utils/analyzeString');

// In-memory database
const store_db = {};

// POST /strings
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

  if (store_db[id]) {
    return res.status(409).json({ error: 'String already exists in the system' });
  }

  const record = { id, value, properties, created_at: new Date().toISOString() };
  store_db[id] = record;

  return res.status(201).json(record);
}

// GET /strings/:string_value
function getString(req, res) {
  const value = decodeURIComponent(req.params.string_value);
  const id = sha256(value);
  const record = store_db[id];
  if (!record) return res.status(404).json({ error: 'String does not exist in the system' });
  return res.status(200).json(record);
}

// GET /strings
function getAllStrings(req, res) {
  try {
    const q = req.query;
    const filters = {};

    if (q.is_palindrome !== undefined) {
      const boolVal = parseBooleanParam(q.is_palindrome);
      if (boolVal === undefined)
        return res.status(400).json({ error: 'Invalid query parameter "is_palindrome"' });
      filters.is_palindrome = boolVal;
    }

    if (q.min_length !== undefined) {
      const n = parseInt(q.min_length, 10);
      if (Number.isNaN(n) || n < 0)
        return res.status(400).json({ error: '"min_length" must be non-negative integer' });
      filters.min_length = n;
    }

    if (q.max_length !== undefined) {
      const n = parseInt(q.max_length, 10);
      if (Number.isNaN(n) || n < 0)
        return res.status(400).json({ error: '"max_length" must be non-negative integer' });
      filters.max_length = n;
    }

    if (q.word_count !== undefined) {
      const n = parseInt(q.word_count, 10);
      if (Number.isNaN(n) || n < 0)
        return res.status(400).json({ error: '"word_count" must be non-negative integer' });
      filters.word_count = n;
    }

    if (q.contains_character !== undefined) {
      const cc = q.contains_character;
      if (typeof cc !== 'string' || cc.length !== 1)
        return res.status(400).json({ error: '"contains_character" must be a single character' });
      filters.contains_character = cc;
    }

    let results = Object.values(store_db);
    if (filters.is_palindrome !== undefined)
      results = results.filter(r => r.properties.is_palindrome === filters.is_palindrome);
    if (filters.min_length !== undefined)
      results = results.filter(r => r.properties.length >= filters.min_length);
    if (filters.max_length !== undefined)
      results = results.filter(r => r.properties.length <= filters.max_length);
    if (filters.word_count !== undefined)
      results = results.filter(r => r.properties.word_count === filters.word_count);
    if (filters.contains_character !== undefined)
      results = results.filter(r =>
        Object.prototype.hasOwnProperty.call(r.properties.character_frequency_map, filters.contains_character)
      );

    return res.status(200).json({ data: results, count: results.length, filters_applied: filters });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /strings/:string_value
function deleteString(req, res) {
  const value = decodeURIComponent(req.params.string_value);
  const id = sha256(value);
  if (!store_db[id]) return res.status(404).json({ error: 'String does not exist in the system' });
  delete store_db[id];
  return res.status(204).send();
}

module.exports = { createString, getString, getAllStrings, deleteString, store_db };
