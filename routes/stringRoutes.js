const express = require('express');
const router = express.Router();
const { createString, getString, getAllStrings, deleteString } = require('../controllers/stringController');

// POST /strings
router.post('/', createString);

// GET /strings (with optional query filters)
router.get('/', getAllStrings);

// GET /strings/:string_value
router.get('/:string_value', getString);

// DELETE /strings/:string_value
router.delete('/:string_value', deleteString);

module.exports = router;
