const helmet = require('helmet');

// Middleware to conditionally apply security headers
function conditionalHelmet(req, res, next) {
  const mode = req.query.mode || req.headers['x-security-mode'] || 'vulnerable';
  
  if (mode === 'secure') {
    // FIXED: Enable helmet with Content Security Policy
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"], // Only allow scripts from same origin
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"], // Allow iframes for demo purposes
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development
    })(req, res, next);
  } else {
    // VULNERABLE MODE: No helmet, no CSP
    next();
  }
}

module.exports = { conditionalHelmet };

