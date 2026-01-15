const mongoose = require('mongoose');

const AttackerDataSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, // 'cookie', 'keystroke', 'dom-manipulation'
  },
  data: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String, // IP or identifier
  },
});

module.exports = mongoose.model('AttackerData', AttackerDataSchema);

