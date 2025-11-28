# 🚀 Quick Vercel Deployment Guide

## Deploy in 10 Minutes

### Step 1: Deploy Backend (5 minutes)

1. **Go to Vercel:** https://vercel.com
2. **Add New Project** → Import `manishisspecial/grandhr`
3. **Configure:**
   - Framework: **Other**
   - Root Directory: **`backend`**
   - Build Command: **`npm run vercel-build`**
   - Output Directory: **(leave empty)**
4. **Environment Variables:**
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=any-random-string
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
5. **Deploy** → Copy URL (e.g., `https://grandhr-backend.vercel.app`)

### Step 2: Deploy Frontend (5 minutes)

1. **Add New Project** → Import same repo
2. **Configure:**
   - Framework: **Vite** (auto-detected)
   - Root Directory: **`.`** (root)
   - Build: **`npm run build`** (auto)
   - Output: **`dist`** (auto)
3. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://grandhr-backend.vercel.app/api
   ```
4. **Deploy** → Copy URL

### Step 3: Update CORS

1. Go to **Backend Project** → Settings → Environment Variables
2. Update `CORS_ORIGIN` with frontend URL
3. Redeploy (auto or manual)

## ✅ Done!

Your app is live! Visit your frontend URL.

For detailed guide, see `VERCEL_DEPLOYMENT.md`

