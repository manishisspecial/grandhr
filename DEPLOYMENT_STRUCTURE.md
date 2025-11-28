# Deployment Structure Explanation

## 📁 Current Project Structure

```
grandhr/                          ← Root folder (frontend files here)
├── src/                          ← Frontend React code
│   ├── components/
│   ├── contexts/
│   ├── services/
│   └── ...
├── package.json                  ← Frontend dependencies
├── vite.config.js                ← Frontend build config
├── vercel.json                   ← Frontend Vercel config
│
└── backend/                      ← Backend folder (separate)
    ├── src/                      ← Backend code
    ├── api/                      ← Vercel serverless entry
    ├── package.json              ← Backend dependencies
    └── vercel.json               ← Backend Vercel config
```

## 🎯 Key Points

### Frontend Location
- ✅ Frontend files are in **ROOT folder** (not in `frontend/` folder)
- ✅ `src/` folder is in root
- ✅ `package.json` is in root
- ✅ `vite.config.js` is in root

### Backend Location
- ✅ Backend files are in **`backend/` folder**
- ✅ `backend/src/` contains backend code
- ✅ `backend/package.json` is separate

## 🚀 Vercel Deployment Configuration

### Frontend Project Settings

**In Vercel Dashboard:**
```
Root Directory: . (root)
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

**Why root?**
- Frontend `package.json` is in root
- Frontend `src/` is in root
- Vite config is in root
- Build output goes to `dist/` in root

### Backend Project Settings

**In Vercel Dashboard:**
```
Root Directory: backend
Framework: Other
Build Command: npm run vercel-build
Output Directory: (empty)
```

**Why `backend`?**
- Backend `package.json` is in `backend/`
- Backend code is in `backend/src/`
- Vercel serverless entry is in `backend/api/`
- Needs separate build process

## ⚠️ Common Mistakes

### ❌ Wrong: Frontend Root = `frontend`
- Frontend files are NOT in `frontend/` folder
- They are in root folder

### ❌ Wrong: Backend Root = `.`
- Backend files are in `backend/` folder
- Must set root to `backend`

### ✅ Correct: 
- Frontend Root: `.` (root)
- Backend Root: `backend`

## 📝 Deployment Summary

**Two Separate Vercel Projects:**

1. **Frontend Project**
   - Repository: `manishisspecial/grandhr`
   - Root: `.` (root folder)
   - Deploys: Frontend React app

2. **Backend Project**
   - Repository: `manishisspecial/grandhr` (same repo!)
   - Root: `backend` (backend folder)
   - Deploys: Backend API

**Same GitHub repository, different root directories!**

---

**This structure is correct and ready for deployment!** ✅

