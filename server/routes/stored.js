const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const ExploitLog = require('../models/ExploitLog');
const { sanitizeHtml, escapeHtml } = require('../utils/security');

// Stored XSS route - supports both vulnerable and secure modes
router.post('/comment', async (req, res) => {
  try {
    const { text, mode } = req.body;
    const securityMode = mode || req.headers['x-security-mode'] || 'vulnerable';
    
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    let processedText = text;
    
    if (securityMode === 'secure') {
      // FIXED: Sanitize input before saving
      processedText = sanitizeHtml(text); // Remove all HTML tags
    }
    // else: VULNERABLE - Save raw input without sanitization
    
    const comment = new Comment({
      text: processedText, // VULNERABLE: Raw text | FIXED: Sanitized text
      ip: req.ip || req.connection.remoteAddress,
    });
    
    await comment.save();
    
    // Log exploit attempt
    const log = new ExploitLog({
      type: 'stored',
      entryPoint: 'POST /stored/comment',
      payload: text,
      executionResult: securityMode === 'secure' ? 'Payload sanitized before storage' : 'Payload stored in database',
      ip: req.ip || req.connection.remoteAddress,
    });
    await log.save();
    
    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

// Return comments - supports both vulnerable and secure modes
router.get('/comments', async (req, res) => {
  try {
    // Limit to last 3 comments
    const comments = await Comment.find().sort({ createdAt: -1 }).limit(3);
    const mode = req.query.mode || req.headers['x-security-mode'] || 'vulnerable';
    
    // Check if client wants JSON (for secure mode) or HTML (for vulnerable mode)
    const acceptHeader = req.headers.accept || '';
    
    if (acceptHeader.includes('application/json') || mode === 'secure') {
      // FIXED: Return JSON for secure mode - frontend will render safely
      res.json(comments);
    } else {
      // VULNERABLE: Direct injection of stored data into HTML
      let htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stored XSS - Comments</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              background: #fff5f5; 
              color: #333;
              min-height: 100vh;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .header {
              background: #f8d7da;
              border: 2px solid #dc3545;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .comment { 
              margin: 15px 0; 
              padding: 20px; 
              border: 2px solid #dc3545; 
              background: #f8d7da; 
              border-radius: 8px;
              position: relative;
            }
            .comment-content {
              min-height: 30px;
              margin-bottom: 10px;
            }
            .timestamp { 
              color: #666; 
              font-size: 0.9em; 
              margin-top: 10px;
              display: inline-block;
            }
            .delete-btn { 
              background: #dc3545; 
              color: white; 
              border: none; 
              padding: 5px 10px; 
              border-radius: 4px; 
              cursor: pointer; 
              margin-left: 10px;
              font-size: 0.85em;
            }
            .delete-btn:hover { background: #c82333; }
            h1 { 
              color: #dc3545; 
              margin: 0 0 10px 0;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 10px;
              border-radius: 4px;
              margin-top: 10px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Stored Comments (Vulnerable Mode)</h1>
              <div class="warning">
                <strong>DANGER:</strong> Comments below are rendered with raw HTML from database. XSS payloads will execute!
              </div>
            </div>
            <div id="comments">
      `;
      
      if (comments.length === 0) {
        htmlResponse += '<p style="color: #888; text-align: center; padding: 40px;">No comments yet. Submit one to see it appear here!</p>';
      } else {
        comments.forEach(comment => {
          // VULNERABLE: Direct injection without encoding - XSS will execute here
          htmlResponse += `
            <div class="comment">
              <div class="comment-content">${comment.text}</div>
              <div class="timestamp">Posted: ${new Date(comment.createdAt).toLocaleString()}</div>
              <button class="delete-btn" onclick="deleteComment('${comment._id}')">Delete</button>
            </div>
          `;
        });
      }
      
      htmlResponse += `
            </div>
          </div>
          <script>
            // Set demo cookies for XSS to steal
            document.cookie = 'stored_session=def456; path=/';
            document.cookie = 'stored_user=john_doe; path=/';
            document.cookie = 'stored_token=token123; path=/';
            
            console.log('📝 Stored XSS page loaded');
            console.log('🍪 Cookies available:', document.cookie);
            function deleteComment(id) {
              if (confirm('Delete this comment?')) {
                fetch('/stored/comment/' + id, { method: 'DELETE' })
                  .then(() => location.reload())
                  .catch(err => alert('Error deleting comment'));
              }
            }
          </script>
        </body>
        </html>
      `;
      
      res.send(htmlResponse);
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Delete specific comment
router.delete('/comment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Clear all comments - for demo purposes
router.delete('/comments', async (req, res) => {
  try {
    await Comment.deleteMany({});
    res.json({ success: true, message: 'All comments cleared' });
  } catch (error) {
    console.error('Error clearing comments:', error);
    res.status(500).json({ error: 'Failed to clear comments' });
  }
});

// Reset entire database - clears all data for fresh start
router.delete('/reset-database', async (req, res) => {
  try {
    // Clear all collections
    await Comment.deleteMany({});
    await ExploitLog.deleteMany({});
    
    // Also clear attacker data if the model is available
    try {
      const AttackerData = require('../models/AttackerData');
      await AttackerData.deleteMany({});
    } catch (err) {
      console.log('AttackerData model not found or already cleared');
    }
    
    console.log('🗑️ Database reset completed - all data cleared');
    res.json({ 
      success: true, 
      message: 'Database reset successfully - all comments, logs, and attacker data cleared',
      cleared: {
        comments: true,
        exploitLogs: true,
        attackerData: true
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

module.exports = router;

