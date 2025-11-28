# GrandHR Complete Setup Guide

This guide will help you set up GrandHR with all features working using Supabase.

## Prerequisites

- Node.js (v18 or higher)
- Supabase account (free tier works)
- npm or yarn

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - Project Name: `GrandHR`
   - Database Password: (choose a strong password - save it!)
   - Region: (choose closest to you)
5. Wait for project to be created (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep this secret!)

3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI format)
   - It looks like: `postgresql://postgres.xxxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres`

### 1.3 Run Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the entire contents of `supabase-complete-schema.sql`
4. Paste and click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

## Step 2: Frontend Setup

### 2.1 Create `.env` File

In the project root, create `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:5000/api
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Step 3: Backend Setup

### 3.1 Navigate to Backend

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Backend `.env` File

Create `backend/.env`:

```env
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# JWT Expiration
JWT_EXPIRES_IN="7d"

# Server Port
PORT=5000

# CORS Origin
CORS_ORIGIN="http://localhost:3000"

# Environment
NODE_ENV="development"

# Supabase (optional, for direct client usage)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Important:** Replace:
- `xxxxx` with your project reference
- `YOUR_PASSWORD` with your database password
- `xx` with your region code

### 3.4 Generate Prisma Client

```bash
npm run prisma:generate
```

### 3.5 Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted:
- Migration name: `init`
- Press Enter to accept

### 3.6 (Optional) Seed Initial Data

```bash
npm run seed
```

This creates a default admin user (you can modify `seed-users.js` first).

### 3.7 Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## Step 4: Verify Setup

### 4.1 Test Frontend

1. Open `http://localhost:3000`
2. You should see the GrandHR landing page
3. Click "Register" to create an account
4. After registration, you'll be logged in

### 4.2 Test Hierarchy

1. Navigate to `/hierarchy` (or click "Hierarchy" in navbar)
2. You should see the hierarchy manager
3. Try adding an employee
4. Data should auto-save to Supabase

### 4.3 Test HR Management

1. Navigate to `/hr/login`
2. Register/Login with HR system
3. Navigate to `/hr/dashboard`
4. You should see the HR dashboard

### 4.4 Test Document Generation

1. Navigate to any document route (e.g., `/offer-letter`)
2. Create a document
3. Generate PDF

## Step 5: Create First Admin User (HR System)

### Option A: Via Supabase Dashboard

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace email with your email):

```sql
-- First, sign up via the frontend to create auth user
-- Then run this to make them admin:

UPDATE user_roles 
SET role = 'ADMIN' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Option B: Via Seed Script

1. Edit `backend/seed-users.js`
2. Change the email/password
3. Run: `npm run seed`

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Check your `DATABASE_URL` in `backend/.env`
- Ensure password is correct
- Try using direct connection (port 5432) instead of pooler (6543)

**Error: "relation does not exist"**
- Run the schema SQL again in Supabase SQL Editor
- Check if migrations ran: `npm run prisma:migrate`

### Frontend Can't Connect to Backend

**Error: "Network Error" or CORS**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check `CORS_ORIGIN` in backend `.env`

### Authentication Issues

**Can't login to Hierarchy**
- Check Supabase credentials in frontend `.env`
- Verify schema was run (check if `hierarchies` table exists)
- Check browser console for errors

**Can't login to HR System**
- Ensure backend is running
- Check if `user_roles` table exists
- Verify JWT_SECRET is set in backend `.env`

### Prisma Issues

**Error: "Prisma Client not generated"**
```bash
cd backend
npm run prisma:generate
```

**Error: "Migration failed"**
- Check database connection
- Ensure schema SQL was run first
- Try: `npm run prisma:migrate reset` (WARNING: deletes all data)

## Features Available

### ✅ Document Generation
- Offer Letters
- Appointment Letters
- Increment Letters
- Relieving Letters
- Termination Letters
- Salary Slips

### ✅ Org Hierarchy
- Visual organization chart
- Add/Edit/Delete employees
- Horizontal/Vertical layouts
- Export to PDF/Image/JSON
- Cloud sync via Supabase

### ✅ HR Management
- Employee Management
- Leave Management
- Attendance Tracking
- Payroll Management
- Performance Reviews
- Documents Management
- Dashboard Analytics

## Next Steps

1. **Customize Company Info**: Update company name and logo in Hierarchy
2. **Add Employees**: Start adding employees to the system
3. **Configure Roles**: Set up admin/HR/Manager roles
4. **Test All Features**: Go through each module to ensure everything works

## Support

- Check browser console for errors
- Check backend terminal for errors
- Verify all environment variables are set
- Ensure both frontend and backend are running

---

**Everything is now set up and ready to use!** 🎉

