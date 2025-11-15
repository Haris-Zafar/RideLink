import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookingsApi';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getMyBookings(filter);
      setBookings(data.data.bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsApi.cancelBooking(bookingId);
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Link to="/rides/search" className="btn btn-primary">
          Find Rides
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`btn ${
            filter === 'pending' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`btn ${
            filter === 'confirmed' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`btn ${
            filter === 'cancelled' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {booking.ride.origin} → {booking.ride.destination}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(booking.ride.date).toLocaleDateString()} at{' '}
                    {booking.ride.time}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Seats:</span>
                  <p className="font-medium">{booking.seatsRequested}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium">{booking.amountDue} PKR</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment:</span>
                  <p className="font-medium capitalize">
                    {booking.paymentStatus}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Method:</span>
                  <p className="font-medium capitalize">
                    {booking.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={
                      booking.driver.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${booking.driver.name}`
                    }
                    alt={booking.driver.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{booking.driver.name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.driver.phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/rides/${booking.ride._id}`}
                    className="btn btn-secondary text-sm"
                  >
                    View Ride
                  </Link>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No {filter} bookings found.
              </p>
              <Link to="/rides/search" className="btn btn-primary">
                Search for Rides
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
