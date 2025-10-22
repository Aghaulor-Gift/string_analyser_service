require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

// In-memory storage: { sha256_hash: record }
const store_db = {};

//   Helper: compute SHA-256 hash of a string
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Helper: analyze string
// Returns properties object
   
function analyzeStringValue(value) {
  const length = value.length;
  const lowered = value.toLowerCase();
  const is_palindrome = lowered === lowered.split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const trimmed = value.trim();
  const word_count = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  const sha = sha256(value);

  // character frequency map (counts each character exactly as in the string)
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

/* 
   Validate that query param (string) represents boolean
   Accepts "true" or "false" only (case-insensitive)
*/


function parseBooleanParam(val) {
  if (val === undefined) return undefined;
  if (typeof val !== 'string') return undefined;
  const lower = val.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  return undefined;
}

/* 
   POST /strings
   Create / Analyze String
*/

app.post('/strings', (req, res) => {
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
    // string already exists (same value -> same sha256)
    return res.status(409).json({ error: 'String already exists in the system' });
  }

  const created_at = new Date().toISOString();
  const record = {
    id,
    value,
    properties,
    created_at
  };

  store_db[id] = record;

  return res.status(201).json(record);
});

/*
   GET /strings/:string_value
   Get Specific String
*/

app.get('/strings/:string_value', (req, res) => {
  // string_value could be URL encoded; decode it
  const raw = req.params.string_value;
  const value = decodeURIComponent(raw);

  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'Invalid string value in path' });
  }

  const id = sha256(value);
  const record = store_db[id];

  if (!record) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  return res.status(200).json(record);
});

/*
   GET /strings
   Get All Strings with Filtering
   Query params:
     is_palindrome (true/false)
     min_length (integer)
     max_length (integer)
     word_count (integer)
     contains_character (single character)
*/

app.get('/strings', (req, res) => {
  try {
    const q = req.query;

    // parse and validate query params
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

    // simple conflict check
    if (filters.min_length !== undefined && filters.max_length !== undefined) {
      if (filters.min_length > filters.max_length) {
        return res.status(400).json({ error: '"min_length" cannot be greater than "max_length"' });
      }
    }

    let results = Object.values(store_db);

    // apply filters
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

    const filters_applied = {};
    // echo only the provided filter params in typed form
    if (filters.is_palindrome !== undefined) filters_applied.is_palindrome = filters.is_palindrome;
    if (filters.min_length !== undefined) filters_applied.min_length = filters.min_length;
    if (filters.max_length !== undefined) filters_applied.max_length = filters.max_length;
    if (filters.word_count !== undefined) filters_applied.word_count = filters.word_count;
    if (filters.contains_character !== undefined) filters_applied.contains_character = filters.contains_character;

    return res.status(200).json({
      data: results,
      count: results.length,
      filters_applied
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

/*
   GET /strings/filter-by-natural-language?query=...
   Basic natural language parser with heuristics (simple)
   Examples supported (heuristics):
     "all single word palindromic strings" => {word_count:1, is_palindrome:true}
     "strings longer than 10 characters" => {min_length:11}
     "palindromic strings that contain the first vowel" => is_palindrome:true, contains_character: 'a'
     "strings containing the letter z" => contains_character: 'z'
*/

app.get('/strings/filter-by-natural-language', (req, res) => {
  const q = req.query.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "query" parameter' });
  }

  const query = q.toLowerCase();
  const parsed = {};

  // single word, single-word, "single word"
  if (query.includes('single word')) {
    parsed.word_count = 1;
  } else {
    // also support "single-word"
    if (query.includes('single-word')) parsed.word_count = 1;
  }

  // palindromic / palindrome
  if (query.includes('palindrom')) {
    parsed.is_palindrome = true;
  }

  // "strings longer than X characters" -> min_length = X+0? spec: "strings longer than 10 characters" → min_length=11
  const longerMatch = query.match(/longer than (\d+)/);
  if (longerMatch) {
    const n = parseInt(longerMatch[1], 10);
    if (!Number.isNaN(n)) {
      parsed.min_length = n + 1;
    }
  }

  // "strings shorter than X characters" -> max_length = X-1
  const shorterMatch = query.match(/shorter than (\d+)/);
  if (shorterMatch) {
    const n = parseInt(shorterMatch[1], 10);
    if (!Number.isNaN(n)) {
      parsed.max_length = Math.max(0, n - 1);
    }
  }

  // "strings containing the letter z" or "containing the letter z"
  const containsLetterMatch = query.match(/letter\s+([a-z0-9])/);
  if (containsLetterMatch) {
    parsed.contains_character = containsLetterMatch[1];
  }

  // "contain the first vowel" -> heuristic: 'a' (lowercase)
  if (query.includes('first vowel')) {
    parsed.contains_character = parsed.contains_character || 'a';
  }

  // If nothing parsed, return 400
  if (Object.keys(parsed).length === 0) {
    return res.status(400).json({ error: 'Unable to parse natural language query' });
  }

  // Conflict detection example: min_length > max_length
  if (parsed.min_length !== undefined && parsed.max_length !== undefined) {
    if (parsed.min_length > parsed.max_length) {
      return res.status(422).json({ error: 'Query parsed but resulted in conflicting filters' });
    }
  }

  // Reuse /strings filtering logic: apply parsed filters
  let results = Object.values(store_db);

  if (parsed.is_palindrome !== undefined) {
    results = results.filter(r => r.properties.is_palindrome === parsed.is_palindrome);
  }
  if (parsed.min_length !== undefined) {
    results = results.filter(r => r.properties.length >= parsed.min_length);
  }
  if (parsed.max_length !== undefined) {
    results = results.filter(r => r.properties.length <= parsed.max_length);
  }
  if (parsed.word_count !== undefined) {
    results = results.filter(r => r.properties.word_count === parsed.word_count);
  }
  if (parsed.contains_character !== undefined) {
    results = results.filter(r => Object.prototype.hasOwnProperty.call(r.properties.character_frequency_map, parsed.contains_character));
  }

  return res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: q,
      parsed_filters: parsed
    }
  });
});

/*
   DELETE /strings/:string_value
   Delete a string by value
*/

app.delete('/strings/:string_value', (req, res) => {
  const raw = req.params.string_value;
  const value = decodeURIComponent(raw);

  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'Invalid string value in path' });
  }

  const id = sha256(value);

  if (!store_db[id]) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  delete store_db[id];

  // success: 204 No Content (empty body)
  return res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`String Analyzer Service running on http://localhost:${PORT}`);
});