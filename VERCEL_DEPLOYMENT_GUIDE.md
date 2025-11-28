# Vercel Deployment Guide - GrandHR

## 📁 Project Structure

```
grandhr/ (root)
├── src/                    # Frontend React code (in root)
├── package.json            # Frontend dependencies
├── vercel.json             # Frontend Vercel config
├── vite.config.js
│
└── backend/                # Backend API (separate folder)
    ├── src/                # Backend code
    ├── api/                # Vercel serverless entry
    ├── package.json        # Backend dependencies
    └── vercel.json         # Backend Vercel config
```

## 🚀 Deployment: Two Separate Projects

### Project 1: Frontend (Root Folder)

**Configuration:**
- **Root Directory:** `.` (root - where frontend files are)
- **Framework Preset:** Vite (auto-detected)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install`

**Environment Variables:**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-url.vercel.app/api
```

**Steps:**
1. Go to Vercel → Add New Project
2. Import: `manishisspecial/grandhr`
3. Framework: **Vite** (auto-detected)
4. Root Directory: **`.`** (root - default)
5. Build/Output: Auto-detected (don't change)
6. Add environment variables
7. Deploy
8. Copy frontend URL: `https://grandhr.vercel.app`

### Project 2: Backend (Backend Folder)

**Configuration:**
- **Root Directory:** `backend` (important!)
- **Framework Preset:** Other
- **Build Command:** `npm run vercel-build`
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

**Environment Variables:**
```
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://grandhr.vercel.app
NODE_ENV=production
```

**Steps:**
1. Go to Vercel → Add New Project
2. Import: `manishisspecial/grandhr` (same repo)
3. Framework: **Other**
4. Root Directory: **`backend`** (change from default!)
5. Build Command: **`npm run vercel-build`**
6. Output Directory: **(leave empty)**
7. Add environment variables
8. Deploy
9. Copy backend URL: `https://grandhr-backend.vercel.app`

### Step 3: Update CORS

After both are deployed:

1. Go to **Backend Project** → Settings → Environment Variables
2. Update `CORS_ORIGIN` with your frontend URL:
   ```
   CORS_ORIGIN=https://grandhr.vercel.app
   ```
3. Redeploy backend (or it auto-redeploys)

## 📋 Quick Checklist

### Frontend Deployment
- [ ] Root Directory: `.` (root)
- [ ] Framework: Vite
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] URL copied

### Backend Deployment
- [ ] Root Directory: `backend` ⚠️ (important!)
- [ ] Framework: Other
- [ ] Build Command: `npm run vercel-build`
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] URL copied

### Post-Deployment
- [ ] CORS_ORIGIN updated with frontend URL
- [ ] Frontend VITE_API_URL updated with backend URL
- [ ] Both projects working
- [ ] Health check passes

## 🔍 Verification

### Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```
Should return: `{"status":"ok","message":"GrandHR API is running"}`

### Test Frontend
1. Visit: `https://your-frontend.vercel.app`
2. Should load landing page
3. Test navigation
4. Test features

## ⚠️ Important Notes

1. **Root Directory is Critical:**
   - Frontend: `.` (root - where `src/` and `package.json` are)
   - Backend: `backend` (where backend `package.json` is)

2. **Same Repository:**
   - Both projects import from same GitHub repo
   - Different root directories separate them

3. **Environment Variables:**
   - Set separately for each project
   - Frontend needs backend URL
   - Backend needs frontend URL (for CORS)

4. **Build Commands:**
   - Frontend: Auto-detected (`npm run build`)
   - Backend: Manual (`npm run vercel-build`)

## 🐛 Troubleshooting

**Frontend build fails:**
- Check root directory is `.` (not `frontend`)
- Verify `package.json` exists in root
- Check Node.js version (18.x)

**Backend build fails:**
- Verify root directory is `backend`
- Check `backend/package.json` exists
- Verify `backend/api/index.ts` exists
- Check Prisma generation works

**CORS errors:**
- Update `CORS_ORIGIN` in backend with exact frontend URL
- Include `https://` protocol
- No trailing slash

**API not found:**
- Check `VITE_API_URL` includes `/api` at end
- Verify backend is deployed and accessible
- Test health endpoint first

---

**Ready to deploy! Follow the steps above.** 🚀

