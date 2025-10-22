const crypto = require('crypto');

// In-memory database
const stringDB = new Map();

// Helper function to analyze a string
function analyze(value) {
  const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');
  const length = value.length;
  const is_palindrome = value.toLowerCase() === value.toLowerCase().split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).filter(Boolean).length;

  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    id: sha256_hash,
    value,
    properties: {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map
    },
    created_at: new Date().toISOString()
  };
}

// POST /strings
exports.analyzeString = (req, res) => {
  if (!req.body || typeof req.body.value === 'undefined') {
    return res.status(400).json({
      error: 'Invalid request body or missing "value" field'
    });
  }

  const { value } = req.body;
  if (!value) return res.status(400).json({ status: 'error', message: 'Missing value field' });
  if (typeof value !== 'string') return res.status(422).json({ status: 'error', message: 'Value must be a string' });

  const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');
  if (stringDB.has(sha256_hash)) {
    return res.status(409).json({ status: 'error', message: 'String already exists' });
  }

  const analyzed = analyze(value);
  stringDB.set(sha256_hash, analyzed);
  res.status(201).json(analyzed);
};

// GET /strings with filtering
exports.getAllStrings = (req, res) => {
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
  if (is_palindrome === undefined && !min_length && !max_length && !word_count && !contains_character) {
    return res.status(400).json({
      message: 'Invalid query parameter values or types'
    });
  }

  let data = Array.from(stringDB.values());

  if (is_palindrome !== undefined) data = data.filter(s => s.properties.is_palindrome === (is_palindrome === 'true'));
  if (min_length) data = data.filter(s => s.properties.length >= parseInt(min_length));
  if (max_length) data = data.filter(s => s.properties.length <= parseInt(max_length));
  if (word_count) data = data.filter(s => s.properties.word_count === parseInt(word_count));
  if (contains_character) data = data.filter(s => s.value.includes(contains_character));

  res.status(200).json({
    data,
    count: data.length,
    filters_applied: req.query
  });
};

// GET /strings/:value
exports.getStringByValue = (req, res) => {
  const { value } = req.params;
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  const record = stringDB.get(hash);
  if (!record) return res.status(404).json({ status: 'error', message: 'String not found' });
  res.status(200).json(record);
};

// DELETE /strings/:value
exports.deleteString = (req, res) => {
  const { value } = req.params;
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  if (!stringDB.has(hash)) return res.status(404).json({ status: 'error', message: 'String not found' });
  stringDB.delete(hash);
  res.status(204).send();
};

// GET /strings/filter-by-natural-language/query
exports.naturalLanguageFilter = (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ status: 'error', message: 'Missing query parameter' });

  const parsed_filters = {};

  if (query.includes('single word')) parsed_filters.word_count = 1;
  if (query.includes('two word')) parsed_filters.word_count = 2;
  if (query.includes('palindromic')) parsed_filters.is_palindrome = true;
  if (query.match(/longer than (\d+)/)) parsed_filters.min_length = parseInt(query.match(/longer than (\d+)/)[1]);
  if (query.match(/shorter than (\d+)/)) parsed_filters.max_length = parseInt(query.match(/shorter than (\d+)/)[1]);
  if (query.match(/containing the letter (\w)/)) parsed_filters.contains_character = query.match(/containing the letter (\w)/)[1];

  if (Object.keys(parsed_filters).length === 0) {
    return res.status(400).json({ status: 'error', message: 'Unable to parse natural language query' });
  }

  let data = Array.from(stringDB.values());
  if (parsed_filters.word_count) data = data.filter(s => s.properties.word_count === parsed_filters.word_count);
  if (parsed_filters.is_palindrome) data = data.filter(s => s.properties.is_palindrome);
  if (parsed_filters.min_length) data = data.filter(s => s.properties.length > parsed_filters.min_length);
  if (parsed_filters.contains_character) data = data.filter(s => s.value.includes(parsed_filters.contains_character));

// Check for conflicting filters (e.g., min_length > max_length)
  if (
      parsed_filters.min_length !== undefined &&
      parsed_filters.max_length !== undefined &&
      parsed_filters.min_length > parsed_filters.max_length
  ) {
      // 422 Unprocessable Entity
      return res.status(422).json({
        message:
          'Unprocessable Entity: Query resulted in conflicting length filters.',
        interpreted_query: { original: query, parsed_filters: parsed_filters },
      })};


  res.status(200).json({
    data,
    count: data.length,
    interpreted_query: {
      original: query,
      parsed_filters
    }
  });
};
