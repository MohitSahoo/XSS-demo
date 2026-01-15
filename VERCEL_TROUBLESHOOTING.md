# Vercel Deployment - Common Issues & Solutions

## 🔴 Build Fails with "Package Not Found" Error

**Error**: `Cannot find module 'express'` or similar

**Causes**:
1. Dependencies not listed in package.json
2. Vercel can't access private packages
3. Node modules not properly structured

**Solutions**:
```bash
# 1. Ensure server/package.json has all dependencies
cd server && npm list

# 2. Make sure package.json uses ^ or ~ versions, not local paths
# 3. Rebuild locally to verify
npm run install-all

# 4. Push changes
git add .
git commit -m "Fix dependencies"
git push origin main

# 5. Redeploy
vercel --prod
```

---

## 🔴 Build Succeeds but API Returns 502/503

**Error**: `502 Bad Gateway` or `503 Service Unavailable`

**Causes**:
1. MongoDB connection string invalid
2. MONGODB_URI environment variable not set
3. MongoDB Atlas IP whitelist blocking connection
4. Connection pooling issues

**Solutions**:
```bash
# 1. Verify MONGODB_URI in Vercel dashboard
# Check format: mongodb+srv://user:password@cluster.mongodb.net/dbname

# 2. Update MongoDB Atlas IP whitelist
# Go to MongoDB Atlas → Network Access → IP Whitelist
# Add: 0.0.0.0/0 (allow all - for demo only!)

# 3. Test connection string locally
mongodb://mongodb+srv://user:password@cluster.mongodb.net/xss-assessment

# 4. Check Vercel logs for actual error
# Dashboard → Deployments → Select latest → Logs
```

**Important**: The error message should appear in Vercel logs - check there first!

---

## 🔴 Frontend Loads but API Calls Fail

**Error**: CORS error in browser console or API timeout

**Causes**:
1. API baseURL not set correctly
2. Relative path `/api` not routing properly
3. Environment variables not applied after set

**Solutions**:
```javascript
// Check what API URL is being used
// Open DevTools → Console → Paste:
console.log(import.meta.env.VITE_API_BASE_URL)

// Should be:
// - /api (production)
// - http://localhost:3001 (development)
```

**If shows wrong URL**:
1. Rebuild: `npm run build`
2. Verify `.env.production` exists and has `VITE_API_BASE_URL=/api`
3. Redeploy from Vercel dashboard

---

## 🔴 "Cannot GET /api/health"

**Error**: Accessing `/api/health` returns 404

**Causes**:
1. API routes not using `/api` prefix
2. vercel.json not routing correctly
3. api/index.js not deployed

**Solutions**:
```bash
# 1. Verify api/index.js exists
ls -la api/

# 2. Check vercel.json routes configuration
cat vercel.json

# 3. Ensure file structure matches:
# api/
#   └── index.js

# 4. Manual redeploy
git push origin main
# Wait for automatic deployment

# 5. Or force redeploy via CLI
vercel --prod --force
```

---

## 🔴 "ECONNREFUSED: Connection refused to MongoDB"

**Error**: MongoDB connection fails immediately

**Causes**:
1. MONGODB_URI environment variable not set
2. MongoDB cluster is paused or down
3. IP whitelist is too restrictive
4. Wrong database name in connection string

**Solutions**:
```bash
# 1. Double-check in Vercel dashboard
# Settings → Environment Variables
# Should see MONGODB_URI with full connection string

# 2. Check MongoDB Atlas
# https://cloud.mongodb.com/v2
# Ensure cluster is "Available" (not paused)

# 3. Verify IP whitelist
# Network Access → IP Whitelist
# Should include 0.0.0.0/0 for Vercel

# 4. Check connection string format
# mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/databasename
# NOT: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net
```

---

## 🔴 Slow API Responses (First Request Takes 10+ Seconds)

**Not actually an error** - this is normal!

**Why**: Serverless functions have "cold start" latency

**Solutions**:
1. **Accept it**: First request takes 1-10 seconds (normal)
2. **Reduce cold start**: 
   - Upgrade to Vercel Pro
   - Minimize function code
   - Use lightweight dependencies
3. **Warm-up pings**: Set up external service to ping `/api/health` every 5 min
4. **Local caching**: Client can cache responses

---

## 🔴 "Cannot find MongoDB connection string"

**Error**: API works but data doesn't persist

**Causes**:
1. Using localhost MongoDB (won't work on Vercel)
2. MONGODB_URI not set in environment
3. Database name doesn't exist

**Solutions**:
```bash
# 1. Use MongoDB Atlas (not local MongoDB)
# https://www.mongodb.com/cloud/atlas

# 2. Verify MONGODB_URI format
# Should be: mongodb+srv://...@cluster.mongodb.net/xss-assessment
# NOT: mongodb://localhost:27017/...

# 3. Set in Vercel:
# Dashboard → Settings → Environment Variables
# Add: MONGODB_URI = mongodb+srv://...

# 4. Redeploy
git commit --allow-empty -m "Redeploy with MongoDB"
git push origin main
```

---

## 🔴 Styles/Images Not Loading

**Error**: Frontend loads but looks broken

**Causes**:
1. Build output not in correct directory
2. Vite build not generating assets
3. Path issues in built files

**Solutions**:
```bash
# 1. Verify build output
ls -la client/dist/

# Should contain: index.html, assets/

# 2. Rebuild locally
npm run build

# 3. Check vite.config.js for build settings
# Build output should be client/dist/

# 4. Clear build cache and redeploy
rm -rf client/dist client/node_modules
npm run build
git add .
git commit -m "Rebuild client"
git push origin main
```

---

## 🔴 "ENOSPC: no space left on device"

**Error**: Build fails with space error

**Causes**:
1. Vercel build environment running out of space
2. node_modules getting too large
3. Large files committed to repo

**Solutions**:
```bash
# 1. Update .gitignore to exclude node_modules
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore

# 2. Clean up large files
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch large_file' -- --all

# 3. Use .vercelignore (already done)
cat .vercelignore

# 4. Commit and push
git add .
git commit -m "Cleanup build files"
git push origin main --force
```

---

## 🔴 Environment Variables Not Applied

**Error**: Variable is set in Vercel but code doesn't see it

**Causes**:
1. Redeployment didn't happen after setting variable
2. Variables set in wrong environment (should be all three)
3. Typo in variable name

**Solutions**:
```bash
# 1. Verify in Vercel dashboard:
# Settings → Environment Variables
# Check: Production, Preview, Development all have the variable

# 2. Force redeploy
# Dashboard → Deployments → 3-dots menu → Redeploy

# OR manually redeploy
git commit --allow-empty -m "Trigger env var redeploy"
git push origin main

# 3. Verify variable name matches code
# Code should use: process.env.MONGODB_URI
# Vercel dashboard should have: MONGODB_URI (exactly)
```

---

## 🔴 "Cannot import axios" or Other Module Errors

**Error**: Client-side JavaScript errors about missing modules

**Causes**:
1. client/package.json missing dependency
2. npm dependencies not installed during build
3. Vite bundling issues

**Solutions**:
```bash
# 1. Verify dependencies in client/package.json
cat client/package.json

# Should include: axios, react, react-dom, react-router-dom, dompurify

# 2. Install dependencies locally
cd client && npm install

# 3. Rebuild
npm run build

# 4. Commit and push
git add .
git commit -m "Install missing dependencies"
git push origin main
```

---

## ✅ Verification Commands

Use these to verify deployment is working:

```bash
# 1. Check health endpoint
curl https://YOUR_DOMAIN.vercel.app/api/health

# Should return: {"status":"ok","mode":"vulnerable"}

# 2. Check frontend loads
curl https://YOUR_DOMAIN.vercel.app | head -20

# Should contain: <!DOCTYPE html>

# 3. Check logs
vercel logs YOUR_PROJECT_NAME

# 4. Check deployments
vercel ls

# 5. Full deployment info
vercel inspect --prod
```

---

## 📞 Getting Help

1. **Check Vercel Logs First**:
   - Dashboard → Deployments → Select one → Logs
   - Error message usually tells you exactly what's wrong

2. **Check MongoDB Logs**:
   - MongoDB Atlas → Database Deployments → Click cluster → Logs

3. **Search Issues**:
   - GitHub Issues (for Vercel or Express)
   - Stack Overflow
   - Vercel Documentation

4. **Still Stuck?**:
   - Vercel Support: https://vercel.com/help
   - MongoDB Support: https://support.mongodb.com/
   - Open an issue in repo with full error message

---

## 📊 Performance Monitoring

Once deployed, monitor using:

```bash
# Check deployment analytics
vercel analytics

# View function execution stats
# Dashboard → Analytics → Functions

# Monitor database performance
# MongoDB Atlas → Metrics
```

---

**Remember**: Vercel is quite forgiving. Most issues are either:
1. Missing/incorrect `MONGODB_URI` environment variable
2. Database connection issues
3. Build not finding dependencies

Check the logs first - they almost always tell you what's wrong!
