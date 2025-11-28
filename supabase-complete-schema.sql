-- ============================================
-- GrandHR Complete Supabase Database Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. HIERARCHY MANAGEMENT (Existing)
-- ============================================

-- Create hierarchies table
CREATE TABLE IF NOT EXISTS hierarchies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS hierarchies_user_id_idx ON hierarchies(user_id);

-- ============================================
-- 2. HR MANAGEMENT TABLES
-- ============================================

-- User Roles Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Leave Status Enum
DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Leave Type Enum
DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM (
    'SICK_LEAVE', 
    'CASUAL_LEAVE', 
    'EARNED_LEAVE', 
    'MATERNITY_LEAVE', 
    'PATERNITY_LEAVE', 
    'COMP_OFF', 
    'LOP'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Attendance Status Enum
DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'HOLIDAY', 'WEEKEND');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  employee_id VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  zip_code VARCHAR(50),
  country VARCHAR(255) DEFAULT 'India',
  department VARCHAR(255),
  designation VARCHAR(255),
  joining_date DATE DEFAULT CURRENT_DATE,
  salary DECIMAL(10, 2),
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS employees_user_id_idx ON employees(user_id);
CREATE INDEX IF NOT EXISTS employees_employee_id_idx ON employees(employee_id);
CREATE INDEX IF NOT EXISTS employees_manager_id_idx ON employees(manager_id);
CREATE INDEX IF NOT EXISTS employees_department_idx ON employees(department);

-- User Roles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'PENDING',
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS leaves_employee_id_idx ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS leaves_status_idx ON leaves(status);
CREATE INDEX IF NOT EXISTS leaves_start_date_idx ON leaves(start_date);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(5, 2),
  status attendance_status DEFAULT 'PRESENT',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS attendances_employee_id_idx ON attendances(employee_id);
CREATE INDEX IF NOT EXISTS attendances_date_idx ON attendances(date);
CREATE INDEX IF NOT EXISTS attendances_employee_date_idx ON attendances(employee_id, date);

-- Payroll Table
CREATE TABLE IF NOT EXISTS payrolls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(employee_id, month, year)
);

CREATE INDEX IF NOT EXISTS payrolls_employee_id_idx ON payrolls(employee_id);
CREATE INDEX IF NOT EXISTS payrolls_year_month_idx ON payrolls(year, month);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS documents_employee_id_idx ON documents(employee_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type);

-- Performance Reviews Table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  period VARCHAR(100) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  goals TEXT,
  achievements TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS performance_reviews_employee_id_idx ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS performance_reviews_reviewer_id_idx ON performance_reviews(reviewer_id);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE hierarchies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Hierarchies Policies (already defined, but ensuring they exist)
DROP POLICY IF EXISTS "Users can view own hierarchies" ON hierarchies;
DROP POLICY IF EXISTS "Users can insert own hierarchies" ON hierarchies;
DROP POLICY IF EXISTS "Users can update own hierarchies" ON hierarchies;
DROP POLICY IF EXISTS "Users can delete own hierarchies" ON hierarchies;

CREATE POLICY "Users can view own hierarchies"
  ON hierarchies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hierarchies"
  ON hierarchies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hierarchies"
  ON hierarchies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hierarchies"
  ON hierarchies FOR DELETE
  USING (auth.uid() = user_id);

-- Employees Policies
CREATE POLICY "Users can view own employee record"
  ON employees FOR SELECT
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Admins and HR can view all employees"
  ON employees FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Users can insert own employee record"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and HR can insert employees"
  ON employees FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Users can update own employee record"
  ON employees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and HR can update employees"
  ON employees FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

-- User Roles Policies
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Leaves Policies
CREATE POLICY "Users can view own leaves"
  ON leaves FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = leaves.employee_id AND user_id = auth.uid()));

CREATE POLICY "Managers can view team leaves"
  ON leaves FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM employees e1
    JOIN employees e2 ON e1.manager_id = e2.id
    WHERE e1.id = leaves.employee_id AND e2.user_id = auth.uid()
  ));

CREATE POLICY "Admins and HR can view all leaves"
  ON leaves FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Users can insert own leaves"
  ON leaves FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = leaves.employee_id AND user_id = auth.uid()));

CREATE POLICY "Managers and HR can update leaves"
  ON leaves FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR', 'MANAGER')));

-- Attendance Policies
CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = attendances.employee_id AND user_id = auth.uid()));

CREATE POLICY "Admins and HR can view all attendance"
  ON attendances FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Users can insert own attendance"
  ON attendances FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = attendances.employee_id AND user_id = auth.uid()));

-- Payroll Policies
CREATE POLICY "Users can view own payroll"
  ON payrolls FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = payrolls.employee_id AND user_id = auth.uid()));

CREATE POLICY "Admins and HR can view all payrolls"
  ON payrolls FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Admins and HR can manage payrolls"
  ON payrolls FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

-- Documents Policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = documents.employee_id AND user_id = auth.uid()));

CREATE POLICY "Admins and HR can view all documents"
  ON documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = documents.employee_id AND user_id = auth.uid()));

-- Performance Reviews Policies
CREATE POLICY "Users can view own reviews"
  ON performance_reviews FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employees WHERE id = performance_reviews.employee_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees WHERE id = performance_reviews.reviewer_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins and HR can view all reviews"
  ON performance_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR')));

CREATE POLICY "Managers can create reviews"
  ON performance_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role IN ('ADMIN', 'HR', 'MANAGER')));

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_hierarchies_updated_at ON hierarchies;
CREATE TRIGGER update_hierarchies_updated_at
  BEFORE UPDATE ON hierarchies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaves_updated_at ON leaves;
CREATE TRIGGER update_leaves_updated_at
  BEFORE UPDATE ON leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendances_updated_at ON attendances;
CREATE TRIGGER update_attendances_updated_at
  BEFORE UPDATE ON attendances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payrolls_updated_at ON payrolls;
CREATE TRIGGER update_payrolls_updated_at
  BEFORE UPDATE ON payrolls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_reviews_updated_at ON performance_reviews;
CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON hierarchies TO authenticated;
GRANT ALL ON employees TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON leaves TO authenticated;
GRANT ALL ON attendances TO authenticated;
GRANT ALL ON payrolls TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON performance_reviews TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to automatically create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (id, role)
  VALUES (NEW.id, 'EMPLOYEE');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user role when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMPLETE!
-- ============================================

