# 🔧 Fix Your Connection String NOW

## The Problem

Your current connection string is:
```
postgresql://postgres:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres
```

**The issue:** It uses `postgres:` but should use `postgres.wntozvbcybwjtgsbdtxw:`

## The Fix

### Option 1: Direct Connection (for migrations)

Edit `backend/.env` and change the DATABASE_URL to:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
```

**Key change:** `postgres:` → `postgres.wntozvbcybwjtgsbdtxw:`

### Option 2: Pooler Connection (recommended)

If direct connection doesn't work, use pooler:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Note:** Replace `ap-south-1` with your actual region (check Supabase dashboard)

## Quick Steps

1. **Open `backend/.env` file**

2. **Find this line:**
   ```
   DATABASE_URL="postgresql://postgres:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
   ```

3. **Change it to:**
   ```
   DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
   ```

4. **Save the file**

5. **Try again:**
   ```bash
   npm run prisma:migrate
   ```

## Complete .env File

Your `backend/.env` should look like this:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

## If Still Not Working

Try the pooler connection format:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**To find your region:**
1. Go to Supabase Dashboard
2. Settings → Database
3. Check the connection string - it will show your region

