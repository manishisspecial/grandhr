# Get Exact Connection String from Supabase

## The Issue

Prisma migrations need the **exact** connection string format from Supabase. The pooler connection might not work for migrations.

## Solution: Get Direct Connection String

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com
2. Login and select your project
3. Go to **Settings** → **Database**

### Step 2: Get Connection String

1. Scroll to **Connection String** section
2. Look for **"URI"** format
3. You'll see something like:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

OR

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Step 3: Copy and Replace

1. Copy the **entire** connection string
2. Replace `[YOUR-PASSWORD]` with: `pSBWN4p5E4PK6PrC`
3. The format should be exactly as shown in Supabase

### Step 4: Update backend/.env

Replace the DATABASE_URL line with the exact string from Supabase.

## Alternative: Try Different Formats

### Format 1: Direct Connection (for migrations)
```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@db.wntozvbcybwjtgsbdtxw.supabase.co:5432/postgres"
```

### Format 2: Pooler Connection (for app)
```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Format 3: Transaction Mode Pooler
```env
DATABASE_URL="postgresql://postgres.wntozvbcybwjtgsbdtxw:pSBWN4p5E4PK6PrC@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

## Important Notes

- **For Prisma Migrations:** Usually need direct connection (port 5432)
- **For Application:** Can use pooler (port 6543)
- **Region:** Check your actual region in Supabase (might not be `ap-south-1`)

## Check Your Region

1. Go to Supabase Dashboard
2. Settings → General
3. Check "Region" - it will show your actual region code

Then update the connection string with your actual region.

