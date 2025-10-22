require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stringRoutes = require('./routes/stringRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Root: brief message (not required by spec but useful)
app.get('/', (req, res) => {
  res.json({ message:' Use POST /strings to analyze and store.' });
});

// Mount routes exactly at /strings per spec
app.use('/strings', stringRoutes);

app.listen(PORT, () => {
  console.log(`String Analyzer Service running on http://localhost:${PORT}`);
});