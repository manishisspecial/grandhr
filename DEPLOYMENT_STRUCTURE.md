# Deployment Structure - GrandHR

## 📁 Current Project Structure

```
grandhr/                          ← Root folder
├── frontend/                     ← Frontend folder (all frontend files here)
│   ├── src/                      ← Frontend React code
│   ├── package.json               ← Frontend dependencies
│   ├── vite.config.js             ← Frontend build config
│   ├── vercel.json                ← Frontend Vercel config
│   └── dist/                      ← Build output
│
└── backend/                       ← Backend folder (all backend files here)
    ├── src/                       ← Backend code
    ├── api/                       ← Vercel serverless entry
    ├── package.json               ← Backend dependencies
    └── vercel.json                ← Backend Vercel config
```

## 🎯 Key Points

### Frontend Location
- ✅ Frontend files are in **`frontend/` folder**
- ✅ `frontend/src/` contains React code
- ✅ `frontend/package.json` is frontend dependencies
- ✅ `frontend/vite.config.js` is build config

### Backend Location
- ✅ Backend files are in **`backend/` folder**
- ✅ `backend/src/` contains backend code
- ✅ `backend/package.json` is backend dependencies

## 🚀 Vercel Deployment Configuration

### Frontend Project Settings

**In Vercel Dashboard:**
```
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

**Why `frontend`?**
- Frontend `package.json` is in `frontend/`
- Frontend `src/` is in `frontend/src/`
- Vite config is in `frontend/`
- Build output goes to `frontend/dist/`

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

### ❌ Wrong: Frontend Root = `.`
- Frontend files are in `frontend/` folder
- Must set root to `frontend`

### ❌ Wrong: Backend Root = `.`
- Backend files are in `backend/` folder
- Must set root to `backend`

### ✅ Correct: 
- Frontend Root: `frontend`
- Backend Root: `backend`

## 📝 Deployment Summary

**Two Separate Vercel Projects:**

1. **Frontend Project**
   - Repository: `manishisspecial/grandhr`
   - Root: `frontend` (frontend folder)
   - Deploys: Frontend React app

2. **Backend Project**
   - Repository: `manishisspecial/grandhr` (same repo!)
   - Root: `backend` (backend folder)
   - Deploys: Backend API

**Same GitHub repository, different root directories!**

---

**This structure is clean and ready for deployment!** ✅
