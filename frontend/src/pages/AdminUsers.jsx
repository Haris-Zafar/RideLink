import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    university: '',
    role: '',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers(filters);
      setUsers(data.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    if (!confirm(`Change user status to ${newStatus}?`)) return;

    try {
      await adminApi.updateUserStatus(userId, newStatus);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select
            className="input"
            value={filters.university}
            onChange={(e) =>
              setFilters({ ...filters, university: e.target.value })
            }
          >
            <option value="">All Universities</option>
            <option value="LUMS">LUMS</option>
            <option value="NUST">NUST</option>
            <option value="FAST">FAST</option>
            <option value="UET">UET</option>
          </select>

          <select
            className="input"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="passenger">Passenger</option>
            <option value="driver">Driver</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">University</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Rides</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img
                        src={
                          user.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${user.name}`
                        }
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      {user.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4">{user.university}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    D: {user.ridesAsDriver} / P: {user.ridesAsPassenger}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={user.status}
                      onChange={(e) =>
                        handleUpdateStatus(user._id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspend</option>
                      <option value="banned">Ban</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="text-center py-8 text-gray-600">No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
