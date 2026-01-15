# Vercel Deployment Configuration Summary

## Changes Made

This document outlines all configuration changes made to enable Vercel deployment.

### 1. **New Files Created**

#### `vercel.json`
- Defines build and deployment configuration
- Routes frontend (React/Vite) to static hosting
- Routes API calls to serverless functions (`/api/**`)
- Sets up environment variable for MongoDB URI

#### `api/index.js`
- Express app configured for serverless execution
- MongoDB connection pooling for serverless environment
- All routes prefixed with `/api`
- Health check endpoint at `/api/health`

#### `.vercelignore`
- Excludes node_modules and other unnecessary files from deployment
- Reduces build size and deployment time

#### `client/.env.production`
- Sets API base URL to `/api` for production (relative path)
- Allows serverless API to serve from same domain

#### `client/.env.local`
- Sets API base URL to `http://localhost:3001` for local development
- Used when running `npm run dev`

#### `VERCEL_DEPLOYMENT.md`
- Comprehensive deployment guide with step-by-step instructions
- Includes troubleshooting section
- Documents all available API endpoints

#### `deploy-to-vercel.sh`
- Quick deployment helper script
- Verifies prerequisites (Git, Vercel CLI)

### 2. **Modified Files**

#### `client/src/utils/axiosConfig.js`
**Change**: Updated axios baseURL configuration
```javascript
// Before:
baseURL: 'http://localhost:3001'

// After:
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
```
**Why**: Allows dynamic API endpoint based on environment

#### `client/vite.config.js`
**Change**: Updated proxy configuration
```javascript
// Before: Multiple proxy routes (/reflected, /stored, /attacker)
// After: Single proxy route (/api)
```
**Why**: Simpler routing, works with new API structure

#### `package.json`
**Change**: Added build scripts
```json
"build": "cd client && npm run build",
"build:all": "npm install && cd server && npm install && cd ../client && npm install && npm run build"
```
**Why**: Vercel uses these scripts for building the project

### 3. **Architecture Changes**

#### Frontend (Client)
- **Before**: React app that proxied to localhost:3001
- **After**: React app that uses relative `/api` paths in production, `http://localhost:3001` in development
- **Build**: Vite builds to `client/dist` folder

#### Backend (API)
- **Before**: Traditional Express server running on port 3001
- **After**: Serverless functions deployed to Vercel
- **Routes**: All endpoints now use `/api` prefix
- **Database**: Uses `MONGODB_URI` environment variable

### 4. **Deployment Flow**

```
Git Push → GitHub
    ↓
GitHub → Vercel (Auto-detected)
    ↓
Vercel Builds Client (client/dist)
    ↓
Vercel Deploys Serverless Functions (/api)
    ↓
Static Site + API available at your-domain.vercel.app
```

### 5. **Environment Variables Required**

For Vercel deployment, set in project settings:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/xss-assessment` |
| `NODE_ENV` | Environment | `production` |

### 6. **API Endpoints**

All endpoints are now accessible with `/api` prefix:

- `GET /api/health` - Health check
- `GET /api/reflected?q=query` - Reflected XSS endpoint
- `POST /api/stored/comment` - Submit comment
- `GET /api/stored/comments` - Get comments
- `DELETE /api/stored/comment/:id` - Delete comment
- `GET /api/attacker/data` - Get stolen data logs
- `GET /api/exploits/logs` - Get exploit logs

### 7. **Local Development**

To test locally:
```bash
npm run install-all     # Install all dependencies
npm run dev            # Start client and server
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API via proxy: http://localhost:3000/api/*

### 8. **Build Process**

Vercel automatically:
1. Installs root dependencies
2. Builds client with Vite
3. Deploys serverless functions
4. Creates CDN distribution

### 9. **Compatibility Notes**

✅ **Compatible with**:
- Node.js 18+
- npm 9+
- Vite 5+
- Express 4+
- MongoDB Atlas

⚠️ **Limitations**:
- Serverless functions have cold start latency
- First request after 5 min of inactivity takes 1-5 seconds
- Free tier has limited function execution time

### 10. **Security Considerations**

- Environment variables are never exposed in client code
- MongoDB URI is server-only secret
- CORS is properly configured
- API runs on HTTPS (Vercel SSL)
- Remember: This is a security demo, not production-ready

---

**Next Step**: Follow `VERCEL_DEPLOYMENT.md` for step-by-step deployment instructions.
