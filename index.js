require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stringRoutes = require('./routes/stringRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Root route – redirect to /strings
app.get('/', (req, res) => {
  res.redirect('/strings');
});

// Mount string routes
app.use('/strings', stringRoutes);

app.listen(PORT, () => {
  console.log(`🚀 String Analyzer Service running at http://localhost:${PORT}`);
});