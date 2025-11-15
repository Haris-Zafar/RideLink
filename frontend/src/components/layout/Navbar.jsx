import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            RideLink
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/rides/search" className="hover:text-primary-600">
                  Search Rides
                </Link>
                {(user?.role === 'driver' || user?.role === 'both') && (
                  <Link to="/rides/my-rides" className="hover:text-primary-600">
                    My Rides
                  </Link>
                )}
                <Link to="/bookings" className="hover:text-primary-600">
                  My Bookings
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-primary-600">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="btn btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
