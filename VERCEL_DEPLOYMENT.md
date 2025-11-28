# Vercel Deployment Guide - GrandHR

## 🚀 Deployment Strategy

**Recommended:** Deploy Frontend and Backend as **separate Vercel projects** for better scalability and management.

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run `supabase-complete-schema.sql` in SQL Editor
- [ ] Get credentials (URL, anon key, database password)

### 2. Environment Variables
- [ ] Prepare all environment variables (see below)
- [ ] Have Supabase credentials ready

## 🎯 Deployment Steps

### Step 1: Deploy Backend First

#### 1.1 Create Backend Project in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import from GitHub: Select `manishisspecial/grandhr`
4. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend` ⚠️ **IMPORTANT: Change from default `.` to `backend`**
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

#### 1.2 Set Backend Environment Variables

In Vercel project settings → Environment Variables, add:

```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=https://your-frontend-url.vercel.app
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 1.3 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. **Copy the deployment URL** (e.g., `https://grandhr-backend.vercel.app`)
4. This is your backend API URL

### Step 2: Deploy Frontend

#### 2.1 Create Frontend Project in Vercel

1. In Vercel dashboard, click **"Add New"** → **"Project"**
2. Import from GitHub: Select `manishisspecial/grandhr` (same repo)
3. **Configure Project:**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `.` (root - default, where frontend files are) ⚠️ **Keep as root, NOT `frontend`**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install`

#### 2.2 Set Frontend Environment Variables

In Vercel project settings → Environment Variables, add:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://grandhr-backend.vercel.app/api
```

**Important:** Replace `grandhr-backend.vercel.app` with your actual backend URL from Step 1.3

#### 2.3 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. **Copy the deployment URL** (e.g., `https://grandhr.vercel.app`)

### Step 3: Update CORS in Backend

After frontend is deployed:

1. Go to Backend project in Vercel
2. Settings → Environment Variables
3. Update `CORS_ORIGIN` with your frontend URL:
   ```
   CORS_ORIGIN=https://grandhr.vercel.app
   ```
4. Redeploy backend (or it will auto-redeploy)

## 🔧 Alternative: Single Project Deployment

If you prefer to deploy both in one project:

1. Create one Vercel project
2. Set root directory to `.` (root)
3. Add `vercel.json` in root (see below)
4. Deploy both together

**Note:** This is more complex and less recommended.

## 📁 Project Structure for Vercel

```
grandhr/
├── vercel.json              # Frontend Vercel config
├── package.json             # Frontend dependencies
├── vite.config.js
├── src/                     # Frontend code
├── dist/                    # Build output (auto-generated)
│
└── backend/
    ├── vercel.json          # Backend Vercel config
    ├── package.json         # Backend dependencies
    ├── api/
    │   └── index.ts         # Vercel serverless function
    └── src/                 # Backend code
```

## 🔍 Verification

### Test Backend
```bash
curl https://your-backend-url.vercel.app/api/health
```
Should return: `{"status":"ok","message":"SquadHR API is running"}`

### Test Frontend
1. Visit your frontend URL
2. Test login/register
3. Test hierarchy feature
4. Test HR features

## 🐛 Troubleshooting

### Backend Issues

**"Module not found"**
- Check `backend/vercel.json` configuration
- Ensure `api/index.ts` exists

**"Database connection failed"**
- Verify `DATABASE_URL` format
- Check Supabase project is active
- Try direct connection (port 5432)

**"CORS error"**
- Update `CORS_ORIGIN` with exact frontend URL
- Include protocol (https://)
- No trailing slash

### Frontend Issues

**"API calls failing"**
- Check `VITE_API_URL` is correct
- Verify backend is deployed and accessible
- Check browser console for errors

**"Build fails"**
- Check Node.js version (Vercel uses 18.x by default)
- Verify all dependencies in `package.json`
- Check build logs in Vercel

**"Routes not working"**
- Verify `vercel.json` has rewrites for SPA
- Check React Router configuration

## 📝 Environment Variables Summary

### Backend (Vercel)
- `DATABASE_URL` - Supabase PostgreSQL connection
- `DIRECT_URL` - Direct database connection (for migrations)
- `JWT_SECRET` - Strong random string
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV` - "production"

### Frontend (Vercel)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_URL` - Backend API URL

## 🚀 Post-Deployment

1. **Update CORS:** Set backend CORS_ORIGIN to frontend URL
2. **Test All Features:** Verify everything works
3. **Set Custom Domain:** (Optional) Add custom domain in Vercel
4. **Monitor:** Check Vercel logs and Supabase dashboard

## 📊 Monitoring

- **Vercel Dashboard:** View deployment logs and analytics
- **Supabase Dashboard:** Monitor database usage
- **Error Tracking:** Check Vercel function logs

## ✅ Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] API health check works
- [ ] Authentication works
- [ ] Hierarchy feature works
- [ ] HR features work
- [ ] CORS configured correctly
- [ ] Environment variables set

---

**Your GrandHR is now live on Vercel!** 🎉

