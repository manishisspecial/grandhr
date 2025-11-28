# GrandHR Quick Start Guide

## 🚀 Get Everything Running in 5 Minutes

### Step 1: Supabase Setup (2 minutes)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Save your database password!

2. **Get Credentials:**
   - Settings → API: Copy URL and anon key
   - Settings → Database: Copy connection string

3. **Run Schema:**
   - Go to SQL Editor
   - Copy/paste `supabase-complete-schema.sql`
   - Click Run

### Step 2: Frontend Setup (1 minute)

1. **Create `.env` in project root:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

### Step 3: Backend Setup (2 minutes)

1. **Create `backend/.env`:**
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
   JWT_SECRET="any-random-string"
   PORT=5000
   CORS_ORIGIN="http://localhost:3000"
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

### Step 4: Test (1 minute)

1. Open http://localhost:3000
2. Register an account
3. Test Hierarchy: `/hierarchy`
4. Test HR: `/hr/login`

## ✅ Done!

All features now work with Supabase:
- ✅ Document Generation
- ✅ Org Hierarchy (Supabase Auth)
- ✅ HR Management (Supabase Database)

For detailed setup, see `COMPLETE_SETUP_GUIDE.md`
