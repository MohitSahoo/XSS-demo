# Vercel Deployment Guide

This project is configured for deployment on Vercel. The setup includes:
- React frontend (Vite) deployed as static site
- Express backend converted to serverless functions
- MongoDB Atlas for database (required)

## Prerequisites

1. **Vercel Account**: Create one at https://vercel.com
2. **MongoDB Atlas Cluster**: 
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free M0 cluster
   - Get your connection string (will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
3. **Git Repository**: Push your code to GitHub (required for Vercel)

## Step 1: Push to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/XSS-demo.git
git push -u origin main
```

## Step 2: Create Vercel Project

### Option A: Using Vercel Web Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your GitHub repository (XSS-demo)
4. Click "Import"
5. Configure project settings:
   - **Framework**: Vite (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
cd /workspaces/XSS-demo
vercel
```

## Step 3: Add Environment Variables

After creating the project on Vercel:

1. Go to your project on https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

**Name**: `MONGODB_URI`
**Value**: `mongodb+srv://username:password@cluster.mongodb.net/xss-assessment`
**Environments**: Select "Production", "Preview", and "Development"

5. Click "Save"
6. Trigger a redeployment:
   - Make a small commit: `git commit --allow-empty -m "Trigger redeployment"`
   - Push to main: `git push`

## Step 4: Build & Test Locally (Optional)

```bash
cd /workspaces/XSS-demo

# Install dependencies
npm run install-all

# Build client
npm run build

# Start server locally (requires MongoDB running)
cd server && npm start
```

## Step 5: Verify Deployment

Once deployed, your app will be available at:
- `https://your-project-name.vercel.app` (Frontend)
- `https://your-project-name.vercel.app/api/health` (Health check)

Test the endpoints:
```bash
# Replace YOUR_DOMAIN with your actual domain
curl https://YOUR_DOMAIN.vercel.app/api/health
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB Atlas cluster is accessible
- Check that IP addresses are whitelisted (add 0.0.0.0/0 for testing)
- Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### Build Failures
- Check Vercel logs: Dashboard → Project → Deployments → Click latest → Logs
- Ensure all dependencies are in package.json files
- Verify Node.js version compatibility (18+)

### API Not Working
- Check that environment variables are set correctly
- Verify routes use `/api` prefix (already configured)
- Check CORS settings in server/middleware/security.js

### Cold Start Issues
- Vercel serverless functions have cold start latency (1-5 sec)
- First request after deployment takes longer
- Consider upgrading to Vercel Pro for faster cold starts

## API Routes Available

All routes are prefixed with `/api`:
- `GET /api/health` - Health check
- `GET /api/reflected?q=query` - Reflected XSS endpoint
- `POST /api/stored/comment` - Post comment (Stored XSS)
- `GET /api/stored/comments` - Get all comments
- `DELETE /api/stored/comment/:id` - Delete comment
- `GET /api/attacker/data` - Attacker data log
- `POST /api/attacker/log` - Log attack
- `GET /api/exploits/logs` - Get exploit logs

## Performance Tips

1. **Use MongoDB Atlas**: Free tier is sufficient for demo
2. **Enable Caching**: Vercel automatically caches static assets
3. **Monitor**: Check Vercel Analytics → Deployments
4. **Optimize Images**: Client already uses optimized assets

## Security Notes

⚠️ **This is a security demo application!** Do NOT use in production without:
- Adding authentication
- Implementing proper authorization
- Using HTTPS (automatically done by Vercel)
- Regularly updating dependencies
- Implementing rate limiting
- Adding CSRF protection

## Next Steps

After successful deployment:
1. Share the URL with others to showcase the XSS vulnerabilities
2. Test both vulnerable and secure modes
3. Monitor logs in Vercel dashboard
4. Iterate on security improvements

---

For more info, see:
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.mongodb.com/cloud/)
- [Express + Vercel](https://vercel.com/guides/using-express-with-vercel)
