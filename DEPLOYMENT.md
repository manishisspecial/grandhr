# GrandHR - Production Deployment Guide

## ✅ Repository Status

**GitHub Repository:** https://github.com/manishisspecial/grandhr.git

The project has been successfully pushed to GitHub and is ready for production deployment.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Import repository: `manishisspecial/grandhr`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL)

**Backend:**
1. In Vercel, create a new project from `backend` folder
2. Set root directory: `backend`
3. Set build command: `npm run build`
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
   - `PORT`

### Option 2: Netlify (Frontend)

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables

### Option 3: Railway (Backend)

1. Go to [railway.app](https://railway.app)
2. New project → Deploy from GitHub
3. Select repository
4. Set root directory: `backend`
5. Add environment variables
6. Deploy

### Option 4: Render

**Frontend:**
- Static Site → Connect GitHub → Select repo
- Build: `npm run build`
- Publish: `dist`

**Backend:**
- Web Service → Connect GitHub → Select repo
- Root directory: `backend`
- Build: `npm install && npm run build`
- Start: `npm start`

## 📋 Pre-Deployment Checklist

### Frontend
- [x] Environment variables configured
- [x] Build successful (`npm run build`)
- [x] All routes working
- [x] Supabase credentials set

### Backend
- [x] Database connection configured
- [x] Prisma migrations run
- [x] Environment variables set
- [x] CORS configured for production domain

### Database
- [x] Supabase schema run
- [x] RLS policies active
- [x] Database accessible

## 🔧 Production Environment Variables

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-url.com/api
```

### Backend
```env
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
JWT_SECRET="strong-production-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="https://your-frontend-url.com"
NODE_ENV="production"
```

## 🧪 Testing Before Deployment

1. **Local Build Test:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Backend Test:**
   ```bash
   cd backend
   npm run build
   npm start
   ```

3. **Test All Features:**
   - Document generation
   - Hierarchy management
   - HR features
   - Authentication

## 📝 Post-Deployment

1. **Update CORS:**
   - Update `CORS_ORIGIN` in backend with production URL
   - Update `VITE_API_URL` in frontend with backend URL

2. **Test Production:**
   - Test all routes
   - Verify authentication
   - Check database connections
   - Test file uploads/exports

3. **Monitor:**
   - Check error logs
   - Monitor database usage
   - Track API performance

## 🔒 Security Checklist

- [ ] Strong JWT_SECRET in production
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] RLS policies active
- [ ] HTTPS enabled
- [ ] No sensitive data in code

## 📊 Monitoring

- **Supabase Dashboard:** Monitor database usage
- **Vercel/Netlify:** Check deployment logs
- **Backend Logs:** Monitor API errors
- **Error Tracking:** Consider Sentry or similar

## 🆘 Troubleshooting

**Build Fails:**
- Check environment variables
- Verify Node.js version
- Check build logs

**Database Connection:**
- Verify DATABASE_URL format
- Check Supabase project status
- Verify network access

**CORS Errors:**
- Update CORS_ORIGIN with exact domain
- Check backend environment variables
- Verify frontend API URL

---

**Your project is now on GitHub and ready for deployment!** 🎉

