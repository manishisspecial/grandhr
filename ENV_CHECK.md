# Environment Variables Check

## ✅ Your .env file should look like this:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Important Notes:

1. **No quotes needed** - Don't wrap values in quotes:
   ```env
   # ❌ WRONG
   VITE_SUPABASE_URL="https://..."
   
   # ✅ CORRECT
   VITE_SUPABASE_URL=https://...
   ```

2. **No spaces** around the `=` sign:
   ```env
   # ❌ WRONG
   VITE_SUPABASE_URL = https://...
   
   # ✅ CORRECT
   VITE_SUPABASE_URL=https://...
   ```

3. **Must start with `VITE_`** - Vite only exposes variables that start with `VITE_`

4. **Restart dev server** - After changing .env, restart with `npm run dev`

## 🔍 How to Verify:

1. Check browser console - you should NOT see the warning about missing Supabase URL/Key
2. If you see the warning, double-check your .env file format
3. Make sure the file is named exactly `.env` (not `.env.txt` or `.env.local`)

## 📍 Where to Get Values:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

