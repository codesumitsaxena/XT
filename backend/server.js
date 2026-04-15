const express    = require('express');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const connectDB          = require('./config/db');
const candidateRoutes    = require('./routes/candidateRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/candidates', candidateRoutes);
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});