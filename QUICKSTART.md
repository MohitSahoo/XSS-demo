# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB running on localhost:27017
- Terminal/Command Prompt access

## Installation Steps

1. **Install all dependencies**
```bash
npm run install-all
```

2. **Start MongoDB** (if not already running)
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod
```

3. **Start the application**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend app on http://localhost:3000

## First Steps

1. Open http://localhost:3000 in your browser
2. You'll see the dashboard with mode toggle
3. Start with **Vulnerable Mode** to see exploits
4. Try the example payloads in each section
5. Switch to **Secure Mode** to see defenses

## Testing XSS

### Reflected XSS
- Go to `/reflected`
- Enter: `<script>alert(1)</script>`
- Click Search
- Alert should execute (vulnerable mode)

### Stored XSS
- Go to `/stored`
- Submit comment: `<img src=x onerror=alert(1)>`
- View comments - alert executes
- Switch to secure mode - alert blocked
- Use "Reset Database" to clear all data for fresh testing

### DOM-Based XSS
- Go to `/dom`
- Add to URL: `#<script>alert(1)</script>`
- Reload page - alert executes
- Switch to secure mode - alert blocked

## Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running
- Check connection string in `server/index.js`

**Port already in use:**
- Change ports in `server/index.js` and `client/vite.config.js`

**Dependencies not installing:**
- Try deleting `node_modules` and reinstalling
- Use `npm install --legacy-peer-deps` if needed

## Next Steps

- Read the full README.md for detailed documentation
- Explore the code to understand vulnerabilities and fixes
- Try creating your own payloads
- Review the security measures implemented

