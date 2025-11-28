# GrandHR Project Structure

## 📁 Optimal Structure for Vercel Deployment

```
grandhr/
├── vercel.json                 # Frontend Vercel configuration
├── .vercelignore               # Files to ignore in frontend deployment
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
│
├── src/                        # Frontend source code
│   ├── components/             # React components
│   │   ├── Hierarchy.jsx      # Org hierarchy manager
│   │   ├── HRDashboard.jsx    # HR dashboard
│   │   ├── Employees.jsx      # Employee management
│   │   ├── Leaves.jsx         # Leave management
│   │   ├── Attendance.jsx     # Attendance tracking
│   │   ├── Payroll.jsx         # Payroll management
│   │   ├── Navbar.jsx         # Navigation
│   │   └── ...                 # Document generators
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/               # API services
│   │   └── hierarchyService.js
│   ├── lib/                    # Libraries
│   │   └── supabase.js        # Supabase client
│   ├── utils/                  # Utilities
│   │   ├── api.js             # Backend API client
│   │   └── pdfUtils.js        # PDF utilities
│   ├── main.jsx                # React entry point
│   └── style.css               # Global styles
│
├── dist/                       # Build output (generated, not committed)
│
├── backend/                    # Backend API (separate Vercel project)
│   ├── vercel.json            # Backend Vercel configuration
│   ├── .vercelignore         # Backend ignore file
│   ├── package.json          # Backend dependencies
│   ├── tsconfig.json         # TypeScript config
│   │
│   ├── api/                   # Vercel serverless functions
│   │   └── index.ts          # API entry point for Vercel
│   │
│   ├── src/                   # Backend source code
│   │   ├── index.ts          # Express app entry
│   │   ├── controllers/      # API controllers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth & rate limiting
│   │   └── utils/            # Utilities
│   │
│   ├── prisma/                # Database schema
│   │   └── schema.prisma     # Prisma schema
│   │
│   └── dist/                  # Build output (generated)
│
├── supabase-complete-schema.sql  # Complete database schema
├── supabase-schema.sql          # Basic schema (hierarchy only)
│
├── README.md                    # Main documentation
├── VERCEL_DEPLOYMENT.md         # Detailed deployment guide
├── QUICK_DEPLOY.md              # Quick deployment steps
├── DEPLOYMENT_CHECKLIST.md      # Deployment checklist
└── PROJECT_STRUCTURE.md         # This file
```

## 🎯 Deployment Strategy

### Separate Projects (Recommended)

**Frontend Project:**
- Root: `.` (project root)
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

**Backend Project:**
- Root: `backend`
- Framework: Other
- Build: `npm run vercel-build`
- Output: (empty - serverless)

### Why Separate?

✅ **Better Performance**
- Frontend: CDN-optimized static files
- Backend: Serverless functions scale independently

✅ **Easier Management**
- Separate environment variables
- Independent deployments
- Better monitoring

✅ **Cost Effective**
- Pay only for what you use
- Frontend: Free tier (static)
- Backend: Serverless pricing

## 📦 What Gets Deployed

### Frontend Deployment Includes:
- ✅ All React components
- ✅ Build output (`dist/`)
- ✅ Static assets
- ✅ Configuration files

### Backend Deployment Includes:
- ✅ Express API
- ✅ Serverless function wrapper
- ✅ Prisma client
- ✅ TypeScript compiled code

### Excluded (via .gitignore/.vercelignore):
- ❌ `node_modules/`
- ❌ `.env` files
- ❌ Build artifacts
- ❌ Logs and temp files

## 🔧 Configuration Files

### Frontend (`vercel.json`)
- SPA routing (React Router)
- Build configuration
- Cache headers

### Backend (`backend/vercel.json`)
- Serverless function routing
- API endpoint configuration
- Environment setup

## 📝 Environment Variables

### Frontend (Vercel)
```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL
```

### Backend (Vercel)
```env
DATABASE_URL
DIRECT_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
NODE_ENV
```

## 🚀 Build Process

### Frontend Build
```bash
npm install
npm run build
# Output: dist/
```

### Backend Build
```bash
cd backend
npm install
npm run vercel-build
# Output: dist/ (TypeScript compiled)
```

## ✅ Ready for Production

The project structure is optimized for:
- ✅ Easy Vercel deployment
- ✅ Separate frontend/backend projects
- ✅ Clean separation of concerns
- ✅ Scalable architecture
- ✅ Production-ready configuration

---

**Your project is structured and ready for Vercel!** 🎉

