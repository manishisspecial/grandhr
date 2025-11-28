import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Layout from './Layout';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isEmployer = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      if (isEmployer) {
        // Employers see all employees
        const params = search ? { search } : {};
        const response = await api.get('/employees', { params });
        setEmployees(response.data.employees || []);
      } else {
        // Employees see only their own profile
        const response = await api.get('/employees/my-profile');
        setEmployees(response.data.employee ? [response.data.employee] : []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // If my-profile endpoint doesn't exist, try regular endpoint
      if (!isEmployer) {
        try {
          const response = await api.get('/employees');
          const allEmployees = response.data.employees || [];
          const myEmployee = allEmployees.find(emp => emp.userId === hrUser?.id);
          setEmployees(myEmployee ? [myEmployee] : []);
        } catch (err) {
          console.error('Failed to fetch employee profile:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title={isEmployer ? "Employees" : "My Profile"} 
      description={isEmployer ? "Manage employee information" : "View your employee profile"} 
      icon="👥"
    >
      <div className="space-y-6">
        {isEmployer && (
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
            </div>
          </div>
        )}
        {!isEmployer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Employee View:</strong> You can view your own profile information here.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Designation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {employee.employeeId || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {employee.user?.email || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {employee.department || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {employee.designation || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No employees found. Make sure the backend API is running.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Employees;

