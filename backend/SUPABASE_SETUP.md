# Backend Supabase Setup

## Quick Setup

1. **Get Supabase Database URL:**
   - Go to Supabase Dashboard → Settings → Database
   - Copy the "Connection String" (URI format)
   - It looks like: `postgresql://postgres.xxxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres`

2. **Create `backend/.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
   JWT_SECRET="your-secret-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   CORS_ORIGIN="http://localhost:3000"
   NODE_ENV="development"
   ```

3. **Run Prisma:**
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start Backend:**
   ```bash
   npm run dev
   ```

## Important Notes

- The backend uses Supabase PostgreSQL database
- Authentication is handled via JWT (separate from Supabase Auth)
- This allows HR system to work independently
- Hierarchy uses Supabase Auth (different system)
- Both use the same Supabase database

## Database Connection

**For Migrations (Direct Connection):**
Use port `5432` instead of `6543`:
```
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-xx.pooler.supabase.com:5432/postgres"
```

**For Application (Pooler Connection):**
Use port `6543`:
```
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Troubleshooting

**Connection Issues:**
- Ensure password is correct
- Try direct connection (5432) for migrations
- Check Supabase project is active

**Schema Issues:**
- Run `supabase-complete-schema.sql` in Supabase SQL Editor first
- Then run `npm run prisma:migrate`

