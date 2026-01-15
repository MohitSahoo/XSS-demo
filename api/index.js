const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { conditionalHelmet } = require('../server/middleware/security');
const reflectedRoutes = require('../server/routes/reflected');
const storedRoutes = require('../server/routes/stored');
const attackerRoutes = require('../server/routes/attacker');
const exploitRoutes = require('../server/routes/exploits');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FIXED: Defense-in-depth - Conditionally apply security headers
app.use(conditionalHelmet);

// MongoDB connection - Use environment variable for connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xss-assessment';

// Create a connection promise that can be reused
let mongoConnection;

const connectMongo = async () => {
  if (mongoConnection) {
    return mongoConnection;
  }

  try {
    mongoConnection = mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoConnection;
    console.log('✅ MongoDB connected');
    return mongoConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/reflected', reflectedRoutes);
app.use('/api/stored', storedRoutes);
app.use('/api/attacker', attackerRoutes);
app.use('/api/exploits', exploitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'vulnerable' });
});

module.exports = app;
