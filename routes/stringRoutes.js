const express = require('express');
const router = express.Router();
const {
  analyzeString,
  getAllStrings,
  getStringByValue,
  deleteString,
  naturalLanguageFilter
} = require('../controllers/stringController');

// 1. Create / Analyze a string
router.post('/', analyzeString);

// 2. Get all strings with optional filters
router.get('/', getAllStrings);

// 3. Natural language filter
router.get('/filter-by-natural-language', naturalLanguageFilter);

// 4. Get a specific string
router.get('/:value', getStringByValue);

// 5. Delete a string
router.delete('/:value', deleteString);

module.exports = router;