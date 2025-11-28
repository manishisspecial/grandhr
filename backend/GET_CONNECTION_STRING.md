# How to Get Your Supabase Connection String

## Quick Steps

1. **Go to Supabase Dashboard**
   - Open https://supabase.com
   - Login to your account
   - Select your project

2. **Navigate to Database Settings**
   - Click **Settings** (gear icon in left sidebar)
   - Click **Database** in the settings menu

3. **Find Connection String**
   - Scroll down to **Connection String** section
   - You'll see several options
   - **For Prisma migrations, use the "URI" format with port 5432**

4. **Copy the Connection String**
   - It will look like this:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```

5. **Replace [YOUR-PASSWORD]**
   - Replace `[YOUR-PASSWORD]` with the actual database password you set when creating the project
   - **Important:** This is the database password, NOT your Supabase account password

6. **Create `backend/.env` file**

   ```env
   DATABASE_URL="postgresql://postgres.abcdefghijklmnop:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="any-random-string-here"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   CORS_ORIGIN="http://localhost:3000"
   NODE_ENV="development"
   ```

## Example

If Supabase shows:
```
postgresql://postgres.xyz123abc:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

And your database password is `MyPass123!`, then your `.env` should have:
```env
DATABASE_URL="postgresql://postgres.xyz123abc:MyPass123!@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

## Important Notes

- **Use port 5432** for Prisma migrations (direct connection)
- **Replace [YOUR-PASSWORD]** with your actual password
- **No spaces** in the connection string
- **Keep the quotes** around the connection string in .env

## After Creating .env

Run these commands:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Troubleshooting

**"Can't reach database server"**
- Check that you replaced `[YOUR-PASSWORD]` with actual password
- Verify the connection string is correct (copy directly from Supabase)
- Make sure your Supabase project is active

**"Authentication failed"**
- Double-check your database password
- Ensure no extra spaces in the connection string
- Try copying the connection string again from Supabase

