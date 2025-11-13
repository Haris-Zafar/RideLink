import { Link } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { Car, Search, Calendar, Star, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      icon: Car,
      label: 'Rides Offered',
      value: user?.ridesOffered || 0,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      label: 'Rides Taken',
      value: user?.ridesTaken || 0,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Star,
      label: 'Rating',
      value: user?.driverRating?.average?.toFixed(1) || 'N/A',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Savings',
      value: `Rs. ${user?.totalSavings || 0}`,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const quickActions = [
    {
      icon: Search,
      title: 'Find a Ride',
      description: 'Search for available rides',
      link: '/search',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: Car,
      title: 'Post a Ride',
      description: 'Offer a ride to others',
      link: '/create-ride',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Calendar,
      title: 'My Rides',
      description: 'View your upcoming rides',
      link: '/my-rides',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to start your carpooling journey?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        {(!user?.emailVerified || !user?.phoneVerified) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please verify your account to access all features.{' '}
                  {!user?.emailVerified && (
                    <Link
                      to="/verify-email"
                      className="font-medium underline hover:text-yellow-600"
                    >
                      Verify Email
                    </Link>
                  )}
                  {!user?.emailVerified && !user?.phoneVerified && ' | '}
                  {!user?.phoneVerified && (
                    <Link
                      to="/verify-phone"
                      className="font-medium underline hover:text-yellow-600"
                    >
                      Verify Phone
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`${action.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
                >
                  <Icon className="w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white opacity-90">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity yet</p>
            <p className="text-sm mt-2">
              Start by posting or booking a ride!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;