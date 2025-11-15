import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600">
            {analytics?.overview.totalUsers || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Drivers</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.overview.totalDrivers || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Rides</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics?.overview.totalRides || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Rides</h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics?.overview.completedRides || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Rides</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {analytics?.overview.activeRides || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {analytics?.overview.totalBookings || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Confirmed Bookings</h3>
          <p className="text-3xl font-bold text-teal-600">
            {analytics?.overview.confirmedBookings || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Reports</h3>
          <p className="text-3xl font-bold text-red-600">
            {analytics?.overview.pendingReports || 0}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity (Last 7 Days)</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="text-2xl font-bold text-primary-600">
                {analytics?.recentActivity.newUsersLastWeek || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Rides</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics?.recentActivity.ridesLastWeek || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Universities</h2>
          <div className="space-y-2">
            {analytics?.topUniversities.map((uni, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{uni.university}</span>
                <span className="font-semibold">{uni.count} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Popular Routes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Origin</th>
                <th className="text-left py-2 px-4">Destination</th>
                <th className="text-right py-2 px-4">Rides</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.popularRoutes.map((route, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{route.origin}</td>
                  <td className="py-2 px-4">{route.destination}</td>
                  <td className="py-2 px-4 text-right font-semibold">
                    {route.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
