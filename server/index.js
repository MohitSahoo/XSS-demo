const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { conditionalHelmet } = require('./middleware/security');
const reflectedRoutes = require('./routes/reflected');
const storedRoutes = require('./routes/stored');
const attackerRoutes = require('./routes/attacker');
const exploitRoutes = require('./routes/exploits');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FIXED: Defense-in-depth - Conditionally apply security headers
// Note: In production, always enable helmet globally: app.use(helmet())
// Here we conditionally apply for demonstration purposes
app.use(conditionalHelmet);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/xss-assessment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/reflected', reflectedRoutes);
app.use('/stored', storedRoutes);
app.use('/attacker', attackerRoutes);
app.use('/exploits', exploitRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'vulnerable' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚠️  MODE: VULNERABLE (Phase 1)`);
});

