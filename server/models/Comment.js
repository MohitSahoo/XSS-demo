const mongoose = require('mongoose');

// VULNERABLE: Raw string storage without sanitization
const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    // VULNERABLE: No validation, no sanitization
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
});

module.exports = mongoose.model('Comment', CommentSchema);

