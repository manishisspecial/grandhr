# Fix Database Connection Error

## The Problem
You're seeing: `Can't reach database server at aws-0-xx.pooler.supabase.com:5432`

This means your `backend/.env` file has placeholder values instead of real Supabase credentials.

## Solution: Get Your Real Supabase Connection String

### Step 1: Get Connection String from Supabase

1. Go to your Supabase Dashboard
2. Click on **Settings** (gear icon)
3. Click on **Database**
4. Scroll down to **Connection String**
5. You'll see several options - use the **URI** format

### Step 2: Copy the Connection String

You'll see something like:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password (the one you set when creating the project).

### Step 3: Update `backend/.env`

Create or edit `backend/.env` file:

```env
# For Application (Pooler - port 6543)
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For Migrations (Direct - port 5432)
DIRECT_URL="postgresql://postgres.abcdefghijklmnop:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

### Step 4: Replace Placeholders

In the connection string you copied:
- Replace `[YOUR-PASSWORD]` with your actual database password
- The `[PROJECT-REF]` and `[REGION]` should already be filled in by Supabase

**Example:**
If Supabase shows:
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

And your password is `MySecurePass123`, then use:
```
postgresql://postgres.abcdefghijklmnop:MySecurePass123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 5: Test Connection

After updating `.env`, try again:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Alternative: Use Connection Pooling Settings

If you're having connection issues, try these variations:

### Option 1: Direct Connection (for migrations)
```env
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"
```

### Option 2: With Connection Pooling (for app)
```env
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"
```

## Common Issues

### Issue: "Can't reach database server"
- **Solution:** Check that your password is correct (no spaces, special characters properly encoded)
- **Solution:** Ensure you're using the correct port (5432 for direct, 6543 for pooler)

### Issue: "Authentication failed"
- **Solution:** Double-check your password
- **Solution:** Make sure you're using the database password, not your Supabase account password

### Issue: "Connection timeout"
- **Solution:** Try using direct connection (port 5432) instead of pooler
- **Solution:** Check if your IP is allowed (Supabase allows all by default)

## Quick Test

To test if your connection string works, you can use:

```bash
# Test connection (if you have psql installed)
psql "postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"
```

Or just try the Prisma command again after fixing the `.env` file.

## Still Having Issues?

1. **Double-check your password** - It's case-sensitive
2. **Copy connection string directly** from Supabase (don't type it manually)
3. **Try direct connection first** (port 5432) for migrations
4. **Check Supabase project status** - Make sure it's active

