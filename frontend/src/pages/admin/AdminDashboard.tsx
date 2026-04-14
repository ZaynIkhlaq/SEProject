import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminUser, AdminUserListResponse } from '../../shared/types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'BRAND' | 'INFLUENCER' | 'ADMIN'>('all');

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', {
        params: { page, pageSize: pagination.pageSize }
      });

      const data: AdminUserListResponse = res.data.data;
      setUsers(data.users);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: Math.ceil(data.total / data.pageSize)
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${email}?`)) return;

    try {
      setActionLoading(userId);
      await axios.patch(`/api/admin/users/${userId}/deactivate`);

      setUsers(users.map(user =>
        user.id === userId ? { ...user, isActive: false } : user
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${email}? This action cannot be undone.`)) return;

    try {
      setActionLoading(userId);
      await axios.delete(`/api/admin/users/${userId}`);

      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted permanently');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: pagination.total,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    brands: users.filter(u => u.role === 'BRAND').length,
    influencers: users.filter(u => u.role === 'INFLUENCER').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage platform users and content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{stats.inactiveUsers}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Brands</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{stats.brands}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Influencers</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{stats.influencers}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Admins</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.admins}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email
            </label>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="BRAND">Brand</option>
              <option value="INFLUENCER">Influencer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'BRAND' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {user.isActive && (
                          <button
                            onClick={() => handleDeactivateUser(user.id, user.email)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:bg-yellow-300"
                          >
                            {actionLoading === user.id ? 'Processing...' : 'Deactivate'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-red-300"
                        >
                          {actionLoading === user.id ? 'Processing...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
