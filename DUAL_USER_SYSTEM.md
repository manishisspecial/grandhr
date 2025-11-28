# GrandHR - Dual User System (Employers & Employees)

## 🎯 Overview

GrandHR is designed to serve **both employers and employees** with a comprehensive HR management solution. The platform provides different features and views based on user roles.

## 👥 User Types

### 1. **Employers** (ADMIN, HR, MANAGER roles)
- Full access to HR management features
- Manage all employees
- Approve/reject leave requests
- View company-wide attendance
- Process payroll for all employees
- Access organizational hierarchy

### 2. **Employees** (EMPLOYEE role)
- View own profile
- Apply for leaves
- Clock in/out for attendance
- View own payroll and payslips
- Access document generation (free)

### 3. **Public Users** (No login required)
- Generate professional HR documents
- Access all document templates
- Export to PDF

## 🔐 Authentication Systems

### System 1: Supabase Auth (Hierarchy Management)
- **Purpose:** Organizational hierarchy visualization
- **Login:** `/login` or `/register`
- **Who uses it:** Employers who want to manage org charts
- **Storage:** Supabase Auth + `hierarchies` table

### System 2: JWT Auth (HR Management)
- **Purpose:** Complete HR operations
- **Login:** `/hr/login`
- **Register:** `/hr/register` (for employees)
- **Who uses it:** Both employers and employees
- **Storage:** Supabase PostgreSQL via backend API

## 📋 Features by User Type

### For Employers (ADMIN/HR/MANAGER)

#### Dashboard
- Total employees count
- Pending leave requests
- Today's attendance
- Pending payrolls

#### Employee Management
- View all employees
- Add/edit/delete employees
- Search employees
- Manage employee profiles

#### Leave Management
- View all leave requests
- Approve/reject leaves
- Filter by status
- View leave history

#### Attendance
- View all employees' attendance
- Track clock in/out
- View attendance reports

#### Payroll
- Process payroll for all employees
- Generate payslips
- View payroll history

### For Employees (EMPLOYEE role)

#### Dashboard
- My leaves count
- My attendance records
- My payrolls
- My profile

#### My Profile
- View own employee information
- Update personal details (if allowed)

#### Leave Management
- Apply for leaves
- View own leave requests
- Check leave status
- View leave balance

#### Attendance
- Clock in/out
- View own attendance history
- Track hours worked

#### Payroll
- View own payslips
- Download payslips
- View salary history

### For Everyone (No Login Required)

#### Document Generation
- **Offer Letter** - Generate professional offer letters
- **Appointment Letter** - Create appointment letters
- **Increment Letter** - Generate salary increment letters
- **Relieving Letter** - Create relieving letters
- **Termination Letter** - Generate termination letters
- **Salary Slip** - Create professional salary slips

**Features:**
- ✅ No login required
- ✅ Free to use
- ✅ Export to PDF
- ✅ Customizable templates
- ✅ Professional formatting

## 🚀 Getting Started

### For Employees

1. **Register:**
   - Go to `/hr/register`
   - Fill in your details
   - You'll be registered as an EMPLOYEE by default

2. **Login:**
   - Go to `/hr/login`
   - Use your email and password

3. **Access Features:**
   - View your dashboard
   - Apply for leaves
   - Clock in/out
   - View your payslips

### For Employers

1. **Contact HR Admin:**
   - Employees are registered with EMPLOYEE role by default
   - HR Admin can upgrade roles to MANAGER, HR, or ADMIN
   - Or register directly with appropriate role (if allowed)

2. **Login:**
   - Go to `/hr/login`
   - Use your credentials

3. **Access Features:**
   - Full HR management dashboard
   - Manage all employees
   - Approve leaves
   - Process payroll

### For Document Generation

1. **No Registration Needed:**
   - Go to any document page (e.g., `/offer-letter`)
   - Fill in the form
   - Generate and download PDF

## 📱 Navigation

### Role-Based Menu

The navigation menu automatically adjusts based on your role:

**Employers see:**
- Documents
- Hierarchy
- HR Management
  - Dashboard
  - Employees (all)
  - Leaves
  - Attendance
  - Payroll

**Employees see:**
- Documents
- HR Management
  - Dashboard
  - My Profile
  - Leaves
  - Attendance
  - Payroll

**Public users see:**
- Documents (all document types)
- Login/Register options

## 🔒 Security & Permissions

### Role Hierarchy
1. **ADMIN** - Full system access
2. **HR** - HR management access
3. **MANAGER** - Team management access
4. **EMPLOYEE** - Self-service access

### Data Access
- **Employees** can only view/modify their own data
- **Employers** can view/modify all employee data
- **Document generation** is public (no data stored)

## 📊 API Endpoints

### Employee Endpoints
- `GET /employees/my-profile` - Get own profile
- `GET /leaves/my-leaves` - Get own leaves
- `GET /attendance/my-attendance` - Get own attendance
- `GET /payroll/my-payrolls` - Get own payrolls

### Employer Endpoints
- `GET /employees` - Get all employees
- `GET /leaves` - Get all leaves
- `GET /attendance` - Get all attendance
- `GET /dashboard/admin` - Admin dashboard

## 🎨 UI Differences

### Dashboard
- **Employers:** See company-wide metrics
- **Employees:** See personal metrics

### Employee List
- **Employers:** See all employees with search/filter
- **Employees:** See only own profile

### Leaves
- **Employers:** See all leaves with approve/reject
- **Employees:** See own leaves with apply option

## ✅ Summary

GrandHR provides:
- ✅ **For Employers:** Complete HR management solution
- ✅ **For Employees:** Self-service HR portal
- ✅ **For Everyone:** Free document generation

All features are role-aware and provide appropriate access based on user permissions.

---

**Ready to use!** Register as an employee or contact your HR admin for employer access.

