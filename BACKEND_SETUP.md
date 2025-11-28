# Backend Setup Guide - GrandHR

This guide will help you set up the HR Management backend API that powers the HR Management features in GrandHR.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (or use Supabase PostgreSQL)
- npm or yarn

## Quick Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grandhr?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**For Supabase PostgreSQL:**
- Go to your Supabase project
- Settings → Database
- Copy the connection string (use the "URI" format)
- Replace `[YOUR-PASSWORD]` with your database password

### 4. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed initial data
npm run seed
```

### 5. Start the Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The backend will run on `http://localhost:5000`

## API Endpoints

The backend provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin/HR only)
- `PUT /api/employees/:id` - Update employee (Admin/HR only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Leaves
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves` - Get all leaves (Admin/HR)
- `GET /api/leaves/my-leaves` - Get my leaves
- `PUT /api/leaves/:id/status` - Update leave status

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/my-attendance` - Get my attendance

### Payroll
- `GET /api/payroll/my-payrolls` - Get my payrolls
- `POST /api/payroll` - Create payroll (Admin/HR)
- `POST /api/payroll/generate` - Generate payrolls (Admin/HR)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/employee` - Employee dashboard data

## Frontend Configuration

In your frontend `.env` file, add:

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Navigate to `/hr/login` in your browser
4. Register a new account or use seeded credentials

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall settings

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- For development, you can set `CORS_ORIGIN="*"` (not recommended for production)

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` accordingly

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a secure `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Consider using a process manager like PM2

## Next Steps

- Set up the database schema
- Create initial admin user
- Configure email notifications (optional)
- Set up file storage for documents (optional)

For more details, see the backend `SETUP.md` file.

