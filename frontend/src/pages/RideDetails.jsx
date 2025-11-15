import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ridesApi } from '../api/ridesApi';
import { bookingsApi } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');
  const [seatsRequested, setSeatsRequested] = useState(1);

  useEffect(() => {
    loadRideDetails();
    if (isAuthenticated && user) {
      loadBookings();
    }
  }, [id, user]);

  const loadRideDetails = async () => {
    try {
      const data = await ridesApi.getRide(id);
      setRide(data.data.ride);
    } catch (error) {
      console.error('Error loading ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!user || ride?.driver?._id !== user.id) return;

    try {
      const data = await bookingsApi.getRideBookings(id);
      setBookings(data.data.bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleRequestBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await bookingsApi.requestBooking({
        rideId: id,
        seatsRequested: parseInt(seatsRequested),
        message: bookingMessage,
      });
      alert('Booking request sent successfully!');
      navigate('/bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request booking');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingsApi.approveBooking(bookingId);
      loadRideDetails();
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await bookingsApi.rejectBooking(bookingId);
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading ride details...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Ride not found</p>
      </div>
    );
  }

  const isDriver = user && ride.driver._id === user.id;
  const canBook = isAuthenticated && !isDriver && ride.availableSeats > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-primary-600 hover:underline"
        >
          ← Back
        </button>

        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {ride.origin} → {ride.destination}
              </h1>
              <p className="text-gray-600">
                {new Date(ride.date).toLocaleDateString()} at {ride.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">
                {ride.costPerPassenger} PKR
              </p>
              <p className="text-sm text-gray-600">per passenger</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-gray-600 text-sm">Available Seats</span>
              <p className="text-xl font-semibold">
                {ride.availableSeats}/{ride.totalSeats}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Status</span>
              <p className="text-xl font-semibold capitalize">{ride.status}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Ride Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {ride.preferences.nonSmoking && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🚭 Non-smoking
                </span>
              )}
              {ride.preferences.acAvailable && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  ❄️ AC Available
                </span>
              )}
              {ride.preferences.musicAllowed && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  🎵 Music Allowed
                </span>
              )}
              {ride.preferences.petsAllowed && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  🐾 Pets Allowed
                </span>
              )}
            </div>
          </div>

          {ride.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-1">Additional Notes</h3>
              <p className="text-gray-700">{ride.notes}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Driver Information</h3>
            <div className="flex items-center">
              <img
                src={
                  ride.driver.profilePhoto ||
                  `https://ui-avatars.com/api/?name=${ride.driver.name}`
                }
                alt={ride.driver.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <p className="text-lg font-semibold">{ride.driver.name}</p>
                <p className="text-sm text-gray-600">{ride.driver.university}</p>
                {ride.driver.driverRating?.average > 0 && (
                  <p className="text-sm">
                    ⭐ {ride.driver.driverRating.average.toFixed(1)} ({ride.driver.driverRating.count} reviews)
                  </p>
                )}
                {ride.driver.vehicle && (
                  <p className="text-sm text-gray-600">
                    {ride.driver.vehicle.color} {ride.driver.vehicle.make}{' '}
                    {ride.driver.vehicle.model}
                  </p>
                )}
              </div>
            </div>
          </div>

          {canBook && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-3">Request to Join</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Seats
                  </label>
                  <select
                    value={seatsRequested}
                    onChange={(e) => setSeatsRequested(e.target.value)}
                    className="input"
                  >
                    {[...Array(Math.min(4, ride.availableSeats))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} seat{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Driver (Optional)
                  </label>
                  <textarea
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    className="input"
                    rows="3"
                    placeholder="Introduce yourself or add any special requests..."
                  />
                </div>
                <button
                  onClick={handleRequestBooking}
                  className="btn btn-primary w-full"
                >
                  Request Booking ({ride.costPerPassenger * seatsRequested} PKR)
                </button>
              </div>
            </div>
          )}

          {isDriver && bookings.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-3">
                Booking Requests ({bookings.filter(b => b.status === 'pending').length} pending)
              </h3>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <img
                          src={
                            booking.passenger.profilePhoto ||
                            `https://ui-avatars.com/api/?name=${booking.passenger.name}`
                          }
                          alt={booking.passenger.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium">{booking.passenger.name}</p>
                          <p className="text-sm text-gray-600">
                            {booking.passenger.university}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.seatsRequested} seat{booking.seatsRequested > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveBooking(booking._id)}
                              className="btn btn-primary text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking._id)}
                              className="btn btn-secondary text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {booking.status !== 'pending' && (
                          <span className="text-sm font-medium capitalize">
                            {booking.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {booking.message && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        "{booking.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
