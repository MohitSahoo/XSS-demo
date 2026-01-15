const express = require('express');
const router = express.Router();
const ExploitLog = require('../models/ExploitLog');
const { escapeHtml } = require('../utils/security');

// Reflected XSS route - supports both vulnerable and secure modes
router.get('/', (req, res) => {
  const query = req.query.q || '';
  const mode = req.query.mode || req.headers['x-security-mode'] || 'vulnerable';
  
  let htmlResponse;
  
  if (mode === 'secure') {
    // FIXED: Encode output to prevent XSS
    const encodedQuery = escapeHtml(query);
    htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Search Results - SECURE MODE</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f8f9fa;
            color: #333;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .result { 
            margin: 20px 0; 
            padding: 20px; 
            border: 2px solid #28a745; 
            background: #d4edda; 
            border-radius: 8px;
          }
          .secure-badge { 
            color: #28a745; 
            font-weight: bold; 
            background: #155724;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
          }
          .query-display {
            background: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            margin: 10px 0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Search Results <span class="secure-badge">SECURE MODE</span></h1>
          <div class="result">
            <h2>🔒 Search completed safely!</h2>
            <p><strong>Your search query:</strong></p>
            <div class="query-display">${encodedQuery}</div>
            <p><strong>Security Status:</strong> ✅ Input properly encoded using HTML entities</p>
            <p><strong>XSS Protection:</strong> ✅ All special characters escaped</p>
            <p>Any XSS payloads in your query have been neutralized and cannot execute.</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #cce5ff; border: 1px solid #0066cc; border-radius: 8px;">
            <strong>🛡️ Security Note:</strong> This page demonstrates proper output encoding. 
            Even if you entered malicious scripts, they are displayed as harmless text.
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    // VULNERABLE: Direct injection without encoding
    // This allows XSS payloads in query parameter to execute
    htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Search Results - VULNERABLE MODE</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #fff5f5;
            color: #333;
            min-height: 100vh;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .result { 
            margin: 20px 0; 
            padding: 20px; 
            border: 2px solid #dc3545; 
            background: #f8d7da; 
            border-radius: 8px;
          }
          .vulnerable-badge { 
            background: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
          }
          .query-display {
            background: #ffe6e6;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            border: 1px solid #ff9999;
            min-height: 50px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .execution-zone {
            background: #ffebee;
            border: 2px dashed #f44336;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            min-height: 100px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Search Results <span class="vulnerable-badge">⚠️ VULNERABLE MODE</span></h1>
          <div class="warning">
            <strong>⚠️ DANGER:</strong> This page is vulnerable to XSS attacks. 
            User input is directly injected into the HTML without encoding.
          </div>
          <div class="result">
            <h2>Search result for: ${query}</h2>
            <!-- VULNERABLE: User input directly injected into HTML -->
            <div class="query-display">
              <strong>Raw Query Injection Point:</strong><br>
              ${query}
            </div>
            <p><strong>Security Status:</strong> ❌ No input encoding applied</p>
            <p><strong>XSS Protection:</strong> ❌ Vulnerable to script injection</p>
          </div>
          
          <div class="execution-zone">
            <h3>🚨 XSS Execution Zone</h3>
            <p>Any JavaScript in the query above will execute in this context.</p>
            <div id="xss-demo-area" style="min-height: 50px; border: 1px solid #ccc; padding: 10px; background: white;">
              <em>XSS effects will appear here...</em>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px;">
            <strong>🔍 Demo Features Available:</strong>
            <ul>
              <li>✅ Alert dialogs will show</li>
              <li>✅ DOM manipulation will be visible</li>
              <li>✅ Cookie access is enabled</li>
              <li>✅ Network requests can be attempted</li>
              <li>✅ Background color changes will apply</li>
            </ul>
          </div>
        </div>
        
        <script>
          // Demo functionality for XSS interaction
          console.log('🔍 Vulnerable page loaded with query:', '${query}');
          
          // Set demo cookies for XSS to steal (without SameSite for better demo)
          document.cookie = 'demo_session=abc123; path=/';
          document.cookie = 'user_token=xyz789; path=/';
          document.cookie = 'preferences=dark_mode; path=/';
          
          // Verify cookies were set
          console.log('🍪 Cookies set:', document.cookie);
          
          // Helper functions that XSS payloads can use
          window.showAlert = function(msg) {
            alert('🚨 XSS Alert: ' + msg);
          };
          
          window.stealCookies = function() {
            const cookies = document.cookie;
            alert('🍪 Cookies stolen: ' + cookies);
            return cookies;
          };
          
          window.changeBackground = function(color) {
            document.body.style.backgroundColor = color;
            alert('🎨 Background changed to: ' + color);
          };
          
          // Log successful page load
          setTimeout(() => {
            console.log('✅ Page fully loaded - XSS payloads can now execute');
            console.log('✅ Cookies available:', document.cookie);
          }, 100);
        </script>
      </body>
      </html>
    `;
  }
  
  // Log the exploit attempt
  if (query) {
    const log = new ExploitLog({
      type: 'reflected',
      entryPoint: 'GET /reflected?q=',
      payload: query,
      executionResult: mode === 'secure' ? 'Payload blocked by HTML encoding' : 'Payload reflected in HTML response - XSS executed',
      ip: req.ip || req.connection.remoteAddress,
    });
    log.save().catch(err => console.error('Log save error:', err));
  }
  
  res.send(htmlResponse);
});

module.exports = router;

