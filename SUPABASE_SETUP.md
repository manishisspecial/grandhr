# Supabase Setup Instructions

## Step 1: Create Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (or log in if you already have one)
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name (e.g., "Salary Slip App")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. In your project root, create a file named `.env` (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important**: Never commit `.env` to git (it's already in `.gitignore`)

## Step 4: Create Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 5: Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a `hierarchies` table
3. Check **Authentication** → **Policies** to verify RLS policies are created

## Step 6: Test the Application

1. Start your development server: `npm run dev`
2. Navigate to `/register` and create an account
3. Check your email for verification (if email confirmation is enabled)
4. Log in and go to `/hierarchy`
5. Create a hierarchy - it should auto-save to Supabase!

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct values
- Make sure you're using the `anon` key, not the `service_role` key
- Restart your dev server after changing `.env`

### "relation 'hierarchies' does not exist"
- Make sure you ran the SQL schema in Step 4
- Check that the table was created in Table Editor

### "new row violates row-level security policy"
- Verify RLS policies were created (Step 4)
- Check Authentication → Policies in Supabase dashboard

### Data not saving
- Check browser console for errors
- Verify you're logged in (check top right of page)
- Check Supabase dashboard → Logs for API errors

## Security Notes

- The `anon` key is safe to use in frontend code
- Row Level Security (RLS) ensures users can only access their own data
- Never expose your `service_role` key in frontend code

## Production Deployment

For production:
1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Use the same Supabase project or create a new one
3. Run the SQL schema on your production database

