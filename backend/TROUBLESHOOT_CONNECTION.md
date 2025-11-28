# Troubleshoot Database Connection

## Current Status
- ✅ Connection string format is correct: `postgres.wntozvbcybwjtgsbdtxw:`
- ❌ Still can't connect to database

## Step 1: Check Supabase Project Status

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Login and check your project

2. **Verify Project is Active**
   - If project shows "Paused" → Click "Restore" or "Resume"
   - Free tier projects pause after 7 days of inactivity
   - Wait 1-2 minutes after resuming

3. **Check Project Health**
   - Go to Settings → General
   - Verify project status is "Active"

## Step 2: Get Fresh Connection String

1. **In Supabase Dashboard:**
   - Settings → Database
   - Scroll to **Connection String**
   - Click **"URI"** tab
   - Copy the **entire** connection string

2. **It should look like one of these:**
   ```
   postgresql://postgres.wntozvbcybwjtgsbdtxw:[YOUR-PASSWORD]@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres
   ```
   OR
   ```
   postgresql://postgres.wntozvbcybwjtgsbdtxw:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

3. **Replace `[YOUR-PASSWORD]` with:** `pSBWN4p5E4PK6PrC`

4. **Update `backend/.env`:**
   ```env
   DATABASE_URL="[paste the exact string from Supabase with password replaced]"
   ```

## Step 3: Try Alternative Connection Methods

### Option A: Use Transaction Mode Pooler

In Supabase Dashboard → Settings → Database, look for **"Transaction"** mode connection string:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"
```

### Option B: Check Your Region

1. Go to Supabase Dashboard
2. Settings → General
3. Note your **Region** (e.g., `ap-south-1`, `us-east-1`, etc.)
4. Update connection string with correct region

### Option C: Use Supabase CLI (Alternative)

If Prisma migrations keep failing, you can run the schema SQL directly:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-complete-schema.sql`
3. Paste and run
4. Then skip Prisma migrations and just generate client:
   ```bash
   npm run prisma:generate
   ```

## Step 4: Verify Network Connection

Test if you can reach Supabase:

```powershell
# Test connection (if you have psql)
psql "postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
```

Or use a simple connection test tool.

## Step 5: Check Firewall/Network

- Ensure your firewall isn't blocking port 5432
- Try from a different network
- Check if your ISP blocks database connections

## Recommended Solution

**Since Prisma migrations are having issues, use this approach:**

1. **Run schema directly in Supabase:**
   - Go to Supabase SQL Editor
   - Run `supabase-complete-schema.sql`
   - This creates all tables

2. **Skip Prisma migrations:**
   ```bash
   # Just generate Prisma client
   npm run prisma:generate
   ```

3. **Start the backend:**
   ```bash
   npm run dev
   ```

The backend will work fine without Prisma migrations if you've run the SQL schema directly in Supabase.

## Quick Fix: Skip Migrations

If you've already run `supabase-complete-schema.sql` in Supabase SQL Editor, you can skip Prisma migrations:

```bash
cd backend
npm run prisma:generate
npm run dev
```

This will work because the tables already exist in Supabase!

