import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Layout from './Layout';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'CASUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const endpoint = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' 
        ? '/leaves' 
        : '/leaves/my-leaves';
      const response = await api.get(endpoint);
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', formData);
      setShowForm(false);
      setFormData({ type: 'CASUAL_LEAVE', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout title="Leaves" description="Manage leave requests" icon="📅">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Apply Leave'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Leave Type</label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="EARNED_LEAVE">Earned Leave</option>
                  <option value="MATERNITY_LEAVE">Maternity Leave</option>
                  <option value="PATERNITY_LEAVE">Paternity Leave</option>
                </select>
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Reason</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Submit Leave Request
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaves...</p>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Leave History</h3>
            {leaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td className="px-6 py-4 text-sm">{leave.type}</td>
                        <td className="px-6 py-4 text-sm">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No leave records found</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaves;

