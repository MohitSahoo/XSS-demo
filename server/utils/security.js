// Security utilities for XSS prevention

// HTML entity encoding
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// FIXED: Sanitize input using DOMPurify
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitizeHtml(dirty) {
  // FIXED: Use DOMPurify to sanitize HTML
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
}

function sanitizeHtmlAllowBasic(dirty) {
  // FIXED: Allow only safe HTML tags
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

module.exports = {
  escapeHtml,
  sanitizeHtml,
  sanitizeHtmlAllowBasic,
};

