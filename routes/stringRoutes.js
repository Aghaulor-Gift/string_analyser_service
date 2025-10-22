const express = require('express');
const router = express.Router();
const {
  createString,
  getString,
  getAllStrings,
  deleteString
} = require('../controllers/stringController');

// Routes
router.post('/', createString);
router.get('/', getAllStrings);
router.get('/:string_value', getString);
router.delete('/:string_value', deleteString);

module.exports = router;

