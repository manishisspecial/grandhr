import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Layout from './Layout';

const HRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

  useEffect(() => {
    if (hrUser) {
      fetchDashboard();
    } else {
      setLoading(false);
      setError('Please login to HR system first');
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const endpoint = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' 
        ? '/dashboard/admin' 
        : '/dashboard/employee';
      const response = await api.get(endpoint);
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" description="HR Management Dashboard" icon="📊">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" description="HR Management Dashboard" icon="📊">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600">Make sure the backend API is running and you are logged in.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" description="HR Management Dashboard" icon="📊">
      <div className="space-y-6">
        {dashboardData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-3xl font-bold text-gray-800">{dashboardData.totalEmployees || 0}</div>
                <div className="text-gray-600">Total Employees</div>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-3xl font-bold text-gray-800">{dashboardData.pendingLeaves || 0}</div>
                <div className="text-gray-600">Pending Leaves</div>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-3xl font-bold text-gray-800">{dashboardData.todayAttendance || 0}</div>
                <div className="text-gray-600">Today's Attendance</div>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-3xl font-bold text-gray-800">{dashboardData.pendingPayrolls || 0}</div>
                <div className="text-gray-600">Pending Payrolls</div>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600">No data available</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HRDashboard;

