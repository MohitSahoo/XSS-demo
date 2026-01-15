# Vercel Deployment - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- [ ] GitHub account with repository pushed
- [ ] Vercel account (free at vercel.com)
- [ ] MongoDB Atlas account (free tier is fine)

### 2. Deploy Now
```bash
npm install -g vercel
vercel --prod
```

### 3. Add Database URL
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add: `MONGODB_URI` = your MongoDB Atlas connection string
5. Redeploy

**That's it! Your app is live! 🎉**

---

## 📚 Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Deployment configuration |
| `api/index.js` | Serverless backend entry point |
| `client/.env.production` | Production API endpoint |
| `client/.env.local` | Local development endpoint |
| `.vercelignore` | Files to exclude from deployment |

---

## 🔗 Key URLs After Deployment

```
Frontend: https://your-project.vercel.app
API:      https://your-project.vercel.app/api
Health:   https://your-project.vercel.app/api/health
```

---

## 📋 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Vercel logs: Dashboard → Deployments → Logs |
| API doesn't work | Verify `MONGODB_URI` env var is set |
| Cold start is slow | Normal - first request takes 1-5 sec |
| Can't find project | Push to GitHub first, then import in Vercel |

---

## 🔐 Remember

✅ Use environment variables for secrets  
✅ Keep MongoDB Atlas IP whitelist updated  
✅ Monitor Vercel usage (free tier limits)  
❌ Don't commit `.env` files  
❌ Don't use in production as-is (it's a demo!)  

---

## 📖 Full Guides

- **Deployment**: See `VERCEL_DEPLOYMENT.md`
- **All Changes**: See `DEPLOYMENT_CHANGES.md`
- **Local Testing**: See root `README.md`

---

**Need help?** Check [Vercel Docs](https://vercel.com/docs) or [MongoDB Docs](https://docs.mongodb.com/cloud/)
