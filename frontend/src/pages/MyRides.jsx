import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi } from '../api/ridesApi';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('scheduled');

  useEffect(() => {
    loadRides();
  }, [filter]);

  const loadRides = async () => {
    setLoading(true);
    try {
      const data = await ridesApi.getMyRides(filter);
      setRides(data.data.rides);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    try {
      await ridesApi.cancelRide(rideId);
      loadRides();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const handleCompleteRide = async (rideId) => {
    if (!confirm('Mark this ride as completed?')) return;

    try {
      await ridesApi.completeRide(rideId);
      loadRides();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete ride');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Rides</h1>
        <Link to="/rides/post" className="btn btn-primary">
          Post New Ride
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('scheduled')}
          className={`btn ${
            filter === 'scheduled' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn ${
            filter === 'completed' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Completed
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
          <p className="text-gray-600">Loading rides...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div key={ride._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {ride.origin} → {ride.destination}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">
                        {new Date(ride.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium">{ride.time}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Seats:</span>
                      <p className="font-medium">
                        {ride.availableSeats}/{ride.totalSeats} available
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <p className="font-medium">{ride.costPerPassenger} PKR</p>
                    </div>
                  </div>

                  {ride.passengers?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-600">
                        Passengers ({ride.passengers.length}):
                      </span>
                      <div className="flex gap-2 mt-1">
                        {ride.passengers.map((passenger) => (
                          <img
                            key={passenger._id}
                            src={
                              passenger.profilePhoto ||
                              `https://ui-avatars.com/api/?name=${passenger.name}`
                            }
                            alt={passenger.name}
                            title={passenger.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    to={`/rides/${ride._id}`}
                    className="btn btn-secondary text-sm"
                  >
                    View Details
                  </Link>

                  {ride.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleCompleteRide(ride._id)}
                        className="btn btn-primary text-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancelRide(ride._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {rides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No {filter} rides found.
              </p>
              <Link to="/rides/post" className="btn btn-primary">
                Post Your First Ride
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRides;
