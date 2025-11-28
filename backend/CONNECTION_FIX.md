# Fix Database Connection - Step by Step

## Current Issue
You're getting: `Can't reach database server at db.wntozvbcybwjtgsbdtxw.supabase.co:5432`

## Solution: Use Pooler Connection

Supabase requires using the **pooler connection** (port 6543) for most operations, or you need to use the correct connection string format.

### Step 1: Get the Correct Connection String

1. Go to Supabase Dashboard
2. Settings → Database
3. Scroll to **Connection String**
4. Look for **"URI"** format
5. Make sure you're using the **pooler** connection (port 6543)

### Step 2: Update `backend/.env`

Your connection string should look like this:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**OR** if Supabase shows a different format, use:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@db.wntozvbcybwjtgsbdtxw.supabase.co:6543/postgres?pgbouncer=true"
```

### Step 3: Try Direct Connection for Migrations

For Prisma migrations, sometimes you need the direct connection. Update your `.env`:

```env
# For migrations (direct connection)
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"

# For application (pooler - use this after migrations)
# DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@db.wntozvbcybwjtgsbdtxw.supabase.co:6543/postgres?pgbouncer=true"

JWT_SECRET="any-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### Step 4: Verify Password

Make sure:
- You're using the **database password** (set when creating project)
- NOT your Supabase account password
- Password is correctly encoded (no special character issues)

### Step 5: Alternative - Use Connection Pooling Settings

If direct connection doesn't work, try this format:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

## Quick Test

1. **Check your Supabase project is active**
   - Go to Supabase Dashboard
   - Make sure project status is "Active"

2. **Verify connection string in Supabase**
   - Settings → Database
   - Copy the exact connection string shown
   - Replace `[YOUR-PASSWORD]` with your actual password

3. **Try the migration again:**
   ```bash
   npm run prisma:migrate
   ```

## Common Issues

### Issue: "Can't reach database server"
- **Solution 1:** Use pooler connection (port 6543) instead of direct (5432)
- **Solution 2:** Check if your IP is blocked (unlikely on free tier)
- **Solution 3:** Verify project is active in Supabase dashboard

### Issue: "Authentication failed"
- **Solution:** Double-check your database password
- **Solution:** Make sure password doesn't have special characters that need encoding

### Issue: "Connection timeout"
- **Solution:** Try using the pooler connection (6543)
- **Solution:** Check your internet connection

## Recommended Connection String Format

Based on your project ID (`wntozvbcybwjtgsbdtxw`), try this:

```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Replace:
- `YOUR_PASSWORD` with your actual database password
- `ap-south-1` with your actual region (check in Supabase dashboard)

## Still Not Working?

1. **Check Supabase Dashboard:**
   - Go to Settings → Database
   - Copy the connection string exactly as shown
   - Don't modify the format

2. **Try Connection Pooling:**
   - Use port 6543 with `?pgbouncer=true`
   - This is the recommended way for Supabase

3. **Verify Project Status:**
   - Make sure your Supabase project is not paused
   - Free tier projects can pause after inactivity

