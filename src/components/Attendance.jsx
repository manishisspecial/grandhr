import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Layout from './Layout';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/my-attendance', {
        params: { limit: 30 },
      });
      setAttendance(response.data.attendances || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/my-attendance', {
        params: { limit: 1 },
      });
      if (response.data.attendances?.[0]) {
        const today = new Date();
        const recordDate = new Date(response.data.attendances[0].date);
        if (today.toDateString() === recordDate.toDateString()) {
          setTodayAttendance(response.data.attendances[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in');
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out', { breakDuration: 0 });
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to clock out');
    }
  };

  return (
    <Layout title="Attendance" description="Track your attendance" icon="⏰">
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Today's Attendance</h3>
          {todayAttendance ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clock In</p>
                  <p className="text-lg font-semibold">
                    {new Date(todayAttendance.clockIn).toLocaleTimeString()}
                  </p>
                </div>
                {todayAttendance.clockOut && (
                  <div>
                    <p className="text-sm text-gray-600">Clock Out</p>
                    <p className="text-lg font-semibold">
                      {new Date(todayAttendance.clockOut).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
              {!todayAttendance.clockOut && (
                <button onClick={handleClockOut} className="btn-primary w-full">
                  Clock Out
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">You haven't clocked in today</p>
              <button onClick={handleClockIn} className="btn-primary w-full">
                Clock In
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Attendance</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Clock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Clock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(record.clockIn).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.hoursWorked ? `${record.hoursWorked.toFixed(2)}h` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No attendance records found</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;

