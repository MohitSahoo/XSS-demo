# ✅ Vercel Deployment Checklist

## Pre-Deployment Tasks

- [ ] **Git Repository**: Code is pushed to GitHub
  ```bash
  git push origin main
  ```

- [ ] **Vercel Account**: Created at https://vercel.com
  
- [ ] **MongoDB Atlas**: Cluster created with connection string ready
  ```
  Format: mongodb+srv://username:password@cluster.mongodb.net/xss-assessment
  ```

## Deployment Tasks

### Option 1: Web Dashboard (Easiest)
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "New Project"
- [ ] Import your XSS-demo GitHub repository
- [ ] Configure settings:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `client/dist`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

### Option 2: Vercel CLI
- [ ] Install: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `cd /workspaces/XSS-demo && vercel --prod`
- [ ] Complete interactive setup

## Post-Deployment Configuration

- [ ] **Add Environment Variables**:
  1. Go to Vercel Dashboard
  2. Select your project
  3. Settings → Environment Variables
  4. Add `MONGODB_URI`:
     - Name: `MONGODB_URI`
     - Value: `mongodb+srv://user:pass@cluster.mongodb.net/xss-assessment`
     - Environments: Production, Preview, Development
  5. Click "Save"

- [ ] **Redeploy with Environment Variables**:
  ```bash
  git commit --allow-empty -m "Trigger redeployment with env vars"
  git push origin main
  ```
  Wait for automatic redeployment

## Verification Tasks

- [ ] **Check Health Endpoint**:
  ```
  https://your-project.vercel.app/api/health
  Should return: {"status":"ok","mode":"vulnerable"}
  ```

- [ ] **Test Frontend**: Visit https://your-project.vercel.app
  - [ ] Dashboard loads
  - [ ] All pages accessible (Dashboard, Reflected XSS, Stored XSS, DOM XSS)
  - [ ] Mode toggle works

- [ ] **Test API Endpoints**:
  - [ ] GET `/api/reflected?q=test` works
  - [ ] GET `/api/stored/comments` works
  - [ ] POST `/api/stored/comment` works
  - [ ] GET `/api/exploits/logs` works

- [ ] **Database Connection**:
  - [ ] Data persists after refresh
  - [ ] Comments save successfully
  - [ ] Logs are recorded

## Optimization (Optional)

- [ ] **Monitor Performance**: 
  Dashboard → Analytics → Check response times

- [ ] **Enable Caching**: 
  Already configured in vercel.json

- [ ] **Set Up Custom Domain** (if desired):
  Settings → Domains

- [ ] **Configure Auto-deployment**:
  Should be automatic from GitHub

## Troubleshooting Checklist

If something doesn't work:

- [ ] Check Vercel Deployment Logs:
  Dashboard → Deployments → Click latest → Logs

- [ ] Verify Environment Variables:
  Settings → Environment Variables → Check `MONGODB_URI`

- [ ] Check MongoDB:
  - [ ] Cluster is running
  - [ ] Connection string is correct
  - [ ] IP whitelist includes 0.0.0.0/0 (or your IP)

- [ ] Rebuild if needed:
  Deployments → 3-dots menu → Redeploy

- [ ] Check Browser Console:
  Open DevTools (F12) → Console tab for JavaScript errors

## Security Notes

⚠️ **This is a security demo, NOT production-ready**

Before going live with any real application:
- [ ] Implement proper authentication
- [ ] Add authorization checks
- [ ] Use HTTPS (automatic with Vercel)
- [ ] Update all dependencies
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Implement CSRF protection
- [ ] Review security.js middleware
- [ ] Remove debug endpoints
- [ ] Use secret management for API keys

## Success Criteria

✅ Deployment is successful when:
1. Frontend loads at your-project.vercel.app
2. API responds at your-project.vercel.app/api/health
3. Database operations work (save/retrieve data)
4. No 502/503 errors in logs
5. Cold start completes within 10 seconds

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.mongodb.com/cloud/)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)
- Full guide: See `VERCEL_DEPLOYMENT.md`
- Changes made: See `DEPLOYMENT_CHANGES.md`
- Quick start: See `VERCEL_QUICK_START.md`

---

**Deployment Date**: ___________
**Project URL**: ___________
**Status**: [ ] Not Started [ ] In Progress [ ] Complete

**Notes**:
