# Environment Variables Setup

## 📝 Quick Setup

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

4. **Restart the dev server** after creating/updating `.env`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## ⚠️ Important Notes

- The `.env` file must be in the **`frontend/`** folder (not root)
- Vite only loads `.env` files from the project root (where `vite.config.js` is)
- After changing `.env`, you must restart the dev server
- Never commit `.env` to Git (it's in `.gitignore`)

## 🔍 Troubleshooting

**Error: "Supabase URL or Anon Key not found"**
- Check that `.env` is in `frontend/` folder
- Verify variable names start with `VITE_`
- Restart the dev server

**Error: "supabaseUrl is required"**
- Make sure `.env` file exists in `frontend/` folder
- Check that values are not empty
- Restart the dev server

