import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Upcoming Rides</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Completed Rides</h3>
            <p className="text-3xl font-bold text-green-600">
              {user?.ridesAsDriver + user?.ridesAsPassenger || 0}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Your Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {user?.driverRating?.average?.toFixed(1) || 'N/A'}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Email:</span> {user?.email}
              {user?.emailVerified && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Verified
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {user?.phone}
              {user?.phoneVerified && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Verified
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">University:</span> {user?.university}
            </div>
            <div>
              <span className="font-medium">Role:</span>{' '}
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
