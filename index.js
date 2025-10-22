require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stringRoutes = require('./routes/stringRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Base route
app.get('/', (req, res) => {
  res.redirect('/strings');
});

// Use routes
app.use('/strings', stringRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`String Analyzer Service running on http://localhost:${PORT}`);
});