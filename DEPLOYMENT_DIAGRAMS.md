# Vercel Deployment - Visual Guides

## 📊 Project Structure for Vercel

```
XSS-demo/
├── vercel.json                 ← Vercel configuration
├── .vercelignore              ← Deployment filter
├── package.json               ← Root config
│
├── client/                    ← Frontend (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.production        ← Sets API_URL=/api
│   ├── .env.local             ← Sets API_URL=http://localhost:3001
│   └── src/
│       ├── utils/
│       │   └── axiosConfig.js ← Uses dynamic API_URL
│       └── pages/
│           ├── Dashboard.jsx
│           ├── ReflectedXSS.jsx
│           ├── StoredXSS.jsx
│           └── DOMXSS.jsx
│
├── api/                       ← Backend (Serverless Functions)
│   └── index.js              ← Express app entry point
│
├── server/                    ← Shared backend code
│   ├── index.js              ← Original server (for reference)
│   ├── package.json
│   ├── middleware/
│   │   └── security.js
│   ├── models/               ← MongoDB models
│   ├── routes/               ← API routes
│   │   ├── reflected.js
│   │   ├── stored.js
│   │   ├── attacker.js
│   │   └── exploits.js
│   └── utils/
│       └── security.js
│
└── Documentation files:
    ├── README_VERCEL_SETUP.md
    ├── VERCEL_QUICK_START.md
    ├── VERCEL_DEPLOYMENT.md
    ├── DEPLOYMENT_CHECKLIST.md
    ├── DEPLOYMENT_CHANGES.md
    ├── VERCEL_TROUBLESHOOTING.md
    └── deploy-to-vercel.sh
```

## 🔄 Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. You: Push code to GitHub                             │
│    git push origin main                                  │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. GitHub: Repository Updated                           │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Vercel Webhook: Triggered                            │
│    - Detected Git push                                  │
│    - Starts build process                               │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Vercel Build Pipeline                                │
│                                                         │
│  a) Install Dependencies                                │
│     npm install                                         │
│     cd server && npm install                            │
│     cd ../client && npm install                         │
│                                                         │
│  b) Build Frontend                                      │
│     cd client && npm run build                          │
│     → Outputs to: client/dist/                          │
│                                                         │
│  c) Deploy Backend                                      │
│     Wraps api/index.js as serverless functions         │
│     Routes via vercel.json                             │
│                                                         │
│  d) Apply Environment Variables                         │
│     MONGODB_URI = mongodb+srv://...                    │
│     NODE_ENV = production                              │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Vercel CDN: Deployment Complete                      │
│                                                         │
│  Frontend: your-project.vercel.app/                    │
│  API:      your-project.vercel.app/api/                │
│  SSL:      HTTPS automatic                             │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Database: MongoDB Atlas (Separate)                   │
│                                                         │
│  MongoDB: mongodb+srv://cluster.mongodb.net/           │
│  Connected via MONGODB_URI env var                      │
│  Stores XSS demo data                                  │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Request Flow in Production

```
USER BROWSER
    │
    ├──────────────────────────────────────────┐
    │                                          │
    │ Request Frontend                         │
    ▼                                          │
https://your-project.vercel.app/              │
    │                                          │
    ▼                                          │
VERCEL CDN                                     │
(Serves static files from client/dist/)        │
    │                                          │
    ├──────────────────────────────────────────┤
    │                                          │
    │ Request API (from client app)            │
    ▼                                          │
https://your-project.vercel.app/api/stored    │
    │                                          │
    ▼                                          │
VERCEL SERVERLESS FUNCTIONS                    │
(Runs api/index.js)                           │
    │                                          │
    ▼                                          │
Express App                                    │
    │                                          │
    ├─► Middleware (CORS, Parser)             │
    ├─► Security checks                       │
    ├─► Route handler                         │
    │                                          │
    ▼                                          │
MONGODB ATLAS                                  │
    │                                          │
    ├─► Query/Insert/Update data              │
    │                                          │
    ▼                                          │
Response sent back to browser                  │
```

## 📱 URL Structure

### Local Development
```
Frontend:  http://localhost:3000/
API:       http://localhost:3000/api/*  (proxied to :3001)
Actual:    http://localhost:3001/
```

### After Vercel Deployment
```
Frontend:  https://your-project.vercel.app/
API:       https://your-project.vercel.app/api/*
Database:  mongodb+srv://... (via MONGODB_URI env var)
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`:

```
GET    /api/health
       └─ Health check

GET    /api/reflected?q=QUERY
       └─ Reflected XSS demo

POST   /api/stored/comment
       └─ Create comment (Stored XSS)

GET    /api/stored/comments
       └─ Get all comments

DELETE /api/stored/comment/:id
       └─ Delete specific comment

DELETE /api/stored/comments
       └─ Delete all comments

DELETE /api/stored/reset-database
       └─ Reset database

GET    /api/attacker/data
       └─ Get stolen data logs

POST   /api/attacker/log
       └─ Log attack

POST   /api/attacker/steal
       └─ Record stolen cookies

GET    /api/exploits/logs
       └─ Get exploit logs
```

## 🔐 Environment Variables Flow

```
┌──────────────────────────────┐
│ Development (Local)          │
├──────────────────────────────┤
│ client/.env.local            │
│ VITE_API_BASE_URL=...        │
│ http://localhost:3001        │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Production (Vercel)          │
├──────────────────────────────┤
│ client/.env.production       │
│ VITE_API_BASE_URL=/api       │
│ (Relative path)              │
│                              │
│ Vercel Environment Variables │
│ MONGODB_URI=...              │
│ NODE_ENV=production          │
└──────────────────────────────┘
```

## 📊 Build Process Timeline

```
Time  │ Event
──────┼────────────────────────────────────────
0 sec │ Git push detected
2 sec │ Vercel build started
5 sec │ Dependencies installed
10 sec│ Client built (Vite)
12 sec│ Backend functions wrapped
15 sec│ Assets optimized
18 sec│ Deployment to CDN
20 sec│ Live! 🚀
```

## 🌍 Global Deployment

```
Your Code (GitHub)
    │
    ├─► Vercel Edge Network (Global CDN)
    │   └─► 30+ data centers worldwide
    │       • Frontend served from closest DC
    │       • ~50ms latency average
    │
    └─► Serverless Functions
        └─► Deployed to nearest region
            • Default: us-west-2
            • Can be configured
```

## 📈 Scaling with Vercel

```
One request:    ~100ms (including cold start)
10 requests:    ~50ms each (functions warmed up)
100 requests:   ~30ms each (concurrent execution)
1000 requests:  Auto-scales, pay per use

Cold start:     1-10 seconds (first request)
Warm requests:  10-50 milliseconds
```

## 🔄 CI/CD Pipeline

```
Git Push
   │
   ▼
GitHub
   │
   ▼ (Webhook)
Vercel Dashboard
   │
   ├─► Lint/Build checks
   ├─► Preview deployment
   │   └─► https://project-branch.vercel.app
   │
   ├─► Manual approval or auto-merge
   │
   └─► Production deployment
       └─► https://project.vercel.app
```

## 💾 Data Flow

```
Frontend Form
    │
    ├─► Validation (client-side)
    │
    ├─► API Call (POST /api/stored/comment)
    │
    ▼
Vercel Serverless Function
    │
    ├─► Receive request
    ├─► Validate input
    ├─► Sanitize/process (secure mode)
    │
    ▼
MongoDB Atlas
    │
    ├─► Save document
    ├─► Return ID
    │
    ▼
Response to Frontend
    │
    └─► Update UI
```

---

**Visual guide updated**: January 15, 2026
**Use these diagrams to understand the deployment architecture!**
