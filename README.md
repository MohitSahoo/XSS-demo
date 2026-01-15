# 🔒 XSS Security Assessment Platform

A comprehensive full-stack security assessment MVP focused on **Cross-Site Scripting (XSS)** vulnerabilities. This platform intentionally implements vulnerabilities, demonstrates real exploit execution, and then fixes them using industry-grade defenses.

> **⚠️ Educational Purpose Only**: This platform is designed for security education and demonstration. All vulnerabilities are intentionally implemented to show real-world attack scenarios.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [XSS Types Explained](#xss-types-explained)
- [Attack → Impact → Fix](#attack--impact--fix)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Security Measures](#security-measures)
- [OWASP Top 10 Mapping](#owasp-top-10-mapping)
- [Secure Coding Checklist](#secure-coding-checklist)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This project demonstrates three types of XSS vulnerabilities:

1. **Reflected XSS** - Server-side vulnerability where user input is immediately reflected in the response
2. **Stored XSS** - Persistent vulnerability where malicious scripts are saved in the database
3. **DOM-Based XSS** - Client-side vulnerability that occurs entirely in the browser

The platform operates in two modes:
- **Vulnerable Mode**: Demonstrates real XSS exploits
- **Secure Mode**: Shows proper mitigation techniques

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **helmet** - Security headers middleware
- **DOMPurify** - HTML sanitization
- **express-validator** - Input validation

### Frontend
- **React** (Vite) - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **DOMPurify** - Client-side sanitization

---

## ✨ Features

### Phase 1: Vulnerable Implementations
- ✅ Reflected XSS with direct HTML injection
- ✅ Stored XSS with database persistence
- ✅ DOM-based XSS with client-side manipulation
- ✅ Exploit logging and detection

### Phase 2: Exploit Demonstration
- ✅ Cookie theft simulation
- ✅ Keystroke logging demonstration
- ✅ DOM manipulation attacks
- ✅ Attacker dashboard showing stolen data

### Phase 3: Secure Implementations
- ✅ HTML entity encoding for reflected XSS
- ✅ Input sanitization for stored XSS
- ✅ Safe DOM manipulation for DOM-based XSS
- ✅ Content Security Policy (CSP) headers
- ✅ Defense-in-depth security measures

### Phase 4: Verification
- ✅ Unit tests for security functions
- ✅ Payload validation tests
- ✅ Before/after comparison logs

---

## 🔍 XSS Types Explained

### 1. Reflected XSS (Non-Persistent)

**How it works:**
- Attacker crafts a malicious URL with an XSS payload
- Victim clicks the link or visits the URL
- Server reflects the payload in the response without encoding
- Browser executes the malicious script

**Example:**
```
https://example.com/search?q=<script>alert(document.cookie)</script>
```

**Impact:**
- Cookie theft
- Session hijacking
- Phishing attacks
- Keylogging

### 2. Stored XSS (Persistent)

**How it works:**
- Attacker submits malicious content (e.g., comment, post)
- Content is stored in the database without sanitization
- When any user views the content, the script executes
- Affects all users who view the malicious content

**Example:**
```html
Comment: <script>fetch('/attacker/log', {method:'POST', body:document.cookie})</script>
```

**Impact:**
- Persistent attacks affecting multiple users
- Data exfiltration
- Account takeover
- Website defacement

### 3. DOM-Based XSS

**How it works:**
- Attack occurs entirely client-side
- JavaScript reads data from URL (hash, query params)
- Data is injected into DOM without sanitization
- No server involvement required

**Example:**
```
https://example.com/page#<img src=x onerror=alert(1)>
```

**Impact:**
- Harder to detect (no server logs)
- Client-side only attacks
- Bypasses server-side protections
- Similar impact to reflected XSS

---

## 📊 Attack → Impact → Fix

| XSS Type | Attack Vector | Impact | Fix |
|----------|--------------|--------|-----|
| **Reflected** | URL query parameter | Cookie theft, session hijacking | HTML entity encoding (`escapeHtml`) |
| **Stored** | Form submission → Database | Persistent attacks, data exfiltration | Input sanitization (`sanitizeHtml`) + Output encoding |
| **DOM-Based** | URL hash/query → DOM | Client-side attacks, bypasses server | Use `textContent` instead of `innerHTML`, DOMPurify |

### Detailed Fixes

#### Reflected XSS Fix
```javascript
// VULNERABLE
res.send(`<h2>Search: ${req.query.q}</h2>`);

// FIXED
const { escapeHtml } = require('./utils/security');
res.send(`<h2>Search: ${escapeHtml(req.query.q)}</h2>`);
```

#### Stored XSS Fix
```javascript
// VULNERABLE
const comment = new Comment({ text: req.body.text });

// FIXED
const { sanitizeHtml } = require('./utils/security');
const comment = new Comment({ text: sanitizeHtml(req.body.text) });
// Frontend: Use React's built-in escaping
<p>{comment.text}</p>
```

#### DOM-Based XSS Fix
```javascript
// VULNERABLE
outputDiv.innerHTML = userInput;

// FIXED - Option 1: textContent
outputDiv.textContent = userInput;

// FIXED - Option 2: DOMPurify
const sanitized = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: [] });
outputDiv.textContent = sanitized;
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd vapt
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
# Or use MongoDB service
```

4. **Start the application**
```bash
# From root directory
npm run dev

# Or start separately:
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 💻 Usage

### Switching Modes

Use the mode toggle in the header to switch between:
- **Vulnerable Mode**: See real XSS exploits in action
- **Secure Mode**: See how proper defenses prevent attacks

### Testing XSS Payloads

#### Reflected XSS
1. Navigate to `/reflected`
2. Enter a payload: `<script>alert(1)</script>`
3. Click "Search"
4. Observe the alert execution (vulnerable mode)
5. Switch to secure mode and try again - payload is encoded

#### Stored XSS
1. Navigate to `/stored`
2. Submit a comment with payload: `<img src=x onerror=alert(1)>`
3. View comments - payload executes
4. Switch to secure mode - payload is sanitized

#### DOM-Based XSS
1. Navigate to `/dom`
2. Add payload to URL: `#<script>alert(1)</script>`
3. Reload page - payload executes
4. Switch to secure mode - payload is blocked

### Example Payloads

```javascript
// Basic alert
<script>alert(1)</script>

// Cookie theft
<script>fetch('/attacker/log', {method:'POST', body:document.cookie})</script>

// Image-based XSS
<img src=x onerror=alert(1)>

// SVG-based XSS
<svg onload=alert(1)>

// Keystroke logging
<script>document.addEventListener('keydown', e => fetch('/attacker/log', {method:'POST', body:e.key}))</script>
```

---

## 📁 Project Structure

```
vapt/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── models/
│   │   ├── Comment.js          # Comment schema
│   │   ├── ExploitLog.js       # Exploit logging schema
│   │   └── AttackerData.js     # Stolen data schema
│   ├── routes/
│   │   ├── reflected.js       # Reflected XSS routes
│   │   ├── stored.js           # Stored XSS routes
│   │   ├── attacker.js         # Attacker simulation routes
│   │   └── exploits.js         # Exploit logging routes
│   ├── middleware/
│   │   └── security.js         # Security middleware (helmet)
│   ├── utils/
│   │   └── security.js         # Security utilities (encoding, sanitization)
│   └── tests/
│       └── xss.test.js         # Security function tests
│
├── client/
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Dashboard with logs
│   │   │   ├── ReflectedXSS.jsx
│   │   │   ├── StoredXSS.jsx
│   │   │   └── DOMXSS.jsx
│   │   ├── components/
│   │   │   └── ModeToggle.jsx  # Mode switcher
│   │   └── utils/
│   │       ├── axiosConfig.js   # Axios configuration
│   │       └── exploitPayloads.js # Example payloads
│   └── package.json
│
└── README.md
```

---

## 🔐 Security Measures

### Defense-in-Depth Strategy

1. **Input Validation**
   - Server-side validation using express-validator
   - Client-side validation (UX only, not security)

2. **Input Sanitization**
   - DOMPurify for HTML sanitization
   - Remove all dangerous tags and attributes

3. **Output Encoding**
   - HTML entity encoding for all user input
   - Context-aware encoding (HTML, JavaScript, CSS, URL)

4. **Content Security Policy (CSP)**
   - Restrict script sources to same origin
   - Prevent inline script execution
   - Block unsafe eval()

5. **Secure Headers**
   - Helmet.js for security headers
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection

6. **Safe DOM Manipulation**
   - Use `textContent` instead of `innerHTML`
   - Use DOMPurify when HTML is necessary
   - Avoid `eval()` and `Function()` constructors

---

## 🎯 OWASP Top 10 Mapping

This project addresses **A03:2021 – Injection** (specifically XSS):

### OWASP Category: A03:2021 – Injection

**XSS is a form of injection attack** where malicious scripts are injected into trusted websites.

**Prevention:**
1. ✅ **Input Validation** - Validate and sanitize all user input
2. ✅ **Output Encoding** - Encode output based on context
3. ✅ **Content Security Policy** - Restrict script execution
4. ✅ **Safe APIs** - Use safe DOM manipulation methods
5. ✅ **Framework Protection** - Use frameworks that auto-escape (React)

---

## ✅ Secure Coding Checklist

### General
- [ ] Never trust user input
- [ ] Validate input on server-side
- [ ] Encode output based on context
- [ ] Use parameterized queries (for SQL)
- [ ] Implement CSP headers
- [ ] Use secure frameworks (React auto-escapes)

### Reflected XSS
- [ ] Encode all user input in HTML responses
- [ ] Use context-aware encoding
- [ ] Validate input format/length
- [ ] Implement rate limiting

### Stored XSS
- [ ] Sanitize input before storing
- [ ] Encode output when displaying
- [ ] Use whitelist approach for allowed HTML
- [ ] Implement content moderation

### DOM-Based XSS
- [ ] Avoid `innerHTML` with user input
- [ ] Use `textContent` for plain text
- [ ] Sanitize with DOMPurify if HTML needed
- [ ] Avoid `eval()` and `Function()`
- [ ] Validate URL parameters client-side

### Defense-in-Depth
- [ ] Enable security headers (helmet)
- [ ] Implement CSP
- [ ] Use HTTPS in production
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🧪 Testing

### Run Tests
```bash
cd server
npm test
```

### Test Coverage
- Security function unit tests
- Payload detection tests
- Encoding/sanitization validation

### Manual Testing
1. Test all payloads in vulnerable mode
2. Verify exploits execute successfully
3. Switch to secure mode
4. Verify payloads are blocked/encoded
5. Check attacker dashboard for logged attempts

---

## 📸 Screenshots

### Vulnerable Mode
- XSS payloads execute successfully
- Alerts pop up
- Cookies can be stolen
- DOM manipulation occurs

### Secure Mode
- Payloads are encoded/sanitized
- No script execution
- Safe rendering
- Security headers active

---

## 🤝 Contributing

This is an educational project. Contributions welcome for:
- Additional XSS vectors
- More comprehensive tests
- Documentation improvements
- UI/UX enhancements

---

## 📝 License

MIT License - Educational use only

---

## ⚠️ Disclaimer

**This project is for educational purposes only.** Do not use these techniques maliciously. Always:
- Get proper authorization before security testing
- Follow responsible disclosure practices
- Respect privacy and data protection laws
- Use only in controlled environments

---

## 📚 Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

## 🎓 Learning Outcomes

After exploring this platform, you should understand:
1. How XSS attacks work (all three types)
2. Real-world impact of XSS vulnerabilities
3. Proper mitigation techniques
4. Defense-in-depth security strategy
5. OWASP Top 10 injection category
6. Secure coding practices

---

**Built for cybersecurity education and demonstration** 🔒

