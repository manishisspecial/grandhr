# Dashboard Not Showing - Troubleshooting Guide

## 🔍 Common Issues and Solutions

### 1. **Backend API Not Running**

**Symptoms:**
- Error: "Failed to load dashboard data"
- Network error in browser console
- Connection refused error

**Solution:**
```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Start the backend server
npm run dev
```

**Verify:**
- Check if backend is running on `http://localhost:5000`
- Visit `http://localhost:5000/api/health` - should return `{"status":"ok"}`
- Check terminal for "🚀 GrandHR Backend Server running on port 5000"

---

### 2. **Not Logged In to HR System**

**Symptoms:**
- Error: "Please login to HR system first"
- Dashboard shows login prompt

**Solution:**
1. Go to `/hr/login`
2. Enter your email and password
3. If you don't have an account, register at `/hr/register`
4. After login, you'll be redirected to dashboard

**Verify:**
- Check browser localStorage for `hr_token` and `hr_user`
- Open DevTools (F12) → Application → Local Storage
- Should see `hr_token` and `hr_user` entries

---

### 3. **Wrong API URL Configuration**

**Symptoms:**
- Network errors pointing to wrong URL
- CORS errors
- 404 errors

**Solution:**
1. Check `frontend/.env` file exists
2. Verify `VITE_API_URL` is set correctly:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. **Important:** Restart frontend dev server after changing `.env`
   ```bash
   # Stop server (Ctrl+C)
   cd frontend
   npm run dev
   ```

**Verify:**
- Check browser console Network tab
- API calls should go to `http://localhost:5000/api/dashboard/...`

---

### 4. **Backend Database Not Set Up**

**Symptoms:**
- Dashboard loads but shows "No data available"
- API returns empty results
- Database connection errors

**Solution:**
1. Make sure Supabase database is set up
2. Run the schema: `supabase-complete-schema.sql` in Supabase SQL Editor
3. Check `backend/.env` has correct `DATABASE_URL`
4. Run Prisma migrations:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

---

### 5. **Authentication Token Issues**

**Symptoms:**
- 401 Unauthorized errors
- Token expired errors
- Redirected to login page

**Solution:**
1. Clear localStorage:
   ```javascript
   // In browser console (F12)
   localStorage.removeItem('hr_token');
   localStorage.removeItem('hr_user');
   ```
2. Login again at `/hr/login`
3. Check token is being sent in requests (Network tab → Headers → Authorization)

---

### 6. **Role-Based Access Issues**

**Symptoms:**
- 403 Forbidden errors
- Wrong dashboard data shown
- Missing features

**Solution:**
- **For Employees:** Use `/dashboard/employee` endpoint (automatic)
- **For Employers:** Need ADMIN, HR, or MANAGER role
- Contact HR admin to upgrade your role if needed

**Check Your Role:**
```javascript
// In browser console
JSON.parse(localStorage.getItem('hr_user')).role
```

---

## 🛠️ Quick Diagnostic Steps

### Step 1: Check Backend
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should see: "🚀 GrandHR Backend Server running on port 5000"
```

### Step 2: Check Frontend
```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"
```

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Go to Network tab
5. Refresh dashboard page
6. Check API calls to `/api/dashboard/...`

### Step 4: Test API Directly
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"GrandHR API is running"}
```

---

## 📋 Checklist

Before reporting issues, verify:

- [ ] Backend server is running (`npm run dev` in `backend/`)
- [ ] Frontend server is running (`npm run dev` in `frontend/`)
- [ ] Logged in to HR system (`/hr/login`)
- [ ] `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
- [ ] `backend/.env` has correct `DATABASE_URL`
- [ ] Database schema is set up in Supabase
- [ ] No errors in browser console (F12)
- [ ] API calls visible in Network tab
- [ ] Token exists in localStorage

---

## 🐛 Still Not Working?

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red error messages
   - Copy error message

2. **Check Network Tab:**
   - Open DevTools → Network
   - Refresh dashboard
   - Find `/api/dashboard/...` request
   - Check Status code and Response

3. **Check Backend Logs:**
   - Look at backend terminal
   - Check for error messages
   - Verify database connection

4. **Verify Environment Variables:**
   ```bash
   # Frontend
   cat frontend/.env
   
   # Backend
   cat backend/.env
   ```

---

## ✅ Expected Behavior

**When Working Correctly:**

1. **Employer Dashboard Shows:**
   - Total Employees count
   - Pending Leaves count
   - Today's Attendance count
   - Pending Payrolls count

2. **Employee Dashboard Shows:**
   - My Leaves count
   - My Attendance count
   - My Payrolls count
   - My Profile (always 1)

3. **No Errors:**
   - No red errors in console
   - API calls return 200 status
   - Data displays correctly

---

**If dashboard still doesn't show after following these steps, check the browser console for specific error messages and share them for further assistance.**

