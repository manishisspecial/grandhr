# Quick Start - HR Management Features

## 🚀 Get HR Management Running in 5 Minutes

### Step 1: Set Up Backend (Required for HR Features)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy from env.template or create with:
DATABASE_URL="postgresql://user:password@localhost:5432/grandhr"
JWT_SECRET="your-secret-key-here"
PORT=5000
CORS_ORIGIN="http://localhost:3000"

# Set up database
npm run prisma:generate
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 2: Configure Frontend

Add to your frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start Frontend

```bash
# From project root
npm run dev
```

### Step 4: Access HR Features

1. Navigate to `/hr/login` in your browser
2. Register a new account (first user will be admin)
3. Access HR features via navbar → "HR Management" dropdown

## Available HR Features

- **Dashboard** (`/hr/dashboard`) - Overview and statistics
- **Employees** (`/hr/employees`) - Manage employee information
- **Leaves** (`/hr/leaves`) - Apply and manage leave requests
- **Attendance** (`/hr/attendance`) - Clock in/out and track hours
- **Payroll** (`/hr/payroll`) - View salary and payslips

## Troubleshooting

**Backend won't start?**
- Check if PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Ensure port 5000 is not in use

**Frontend can't connect?**
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend .env
- Check browser console for CORS errors

**Can't login?**
- Make sure backend is running
- Check backend logs for errors
- Verify database is set up correctly

## Next Steps

- See `BACKEND_SETUP.md` for detailed backend setup
- See `INTEGRATION_SUMMARY.md` for complete integration details

---

**Note:** Document generation features work without the backend. Only HR Management features require the backend API.

