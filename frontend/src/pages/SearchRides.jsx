import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi } from '../api/ridesApi';

const SearchRides = () => {
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    minSeats: 1,
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const data = await ridesApi.searchRides(filters);
      setRides(data.data.rides);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-search on mount with no filters (show all rides)
    handleSearch();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Rides</h1>

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Origin"
              className="input"
              value={filters.origin}
              onChange={(e) =>
                setFilters({ ...filters, origin: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Destination"
              className="input"
              value={filters.destination}
              onChange={(e) =>
                setFilters({ ...filters, destination: e.target.value })
              }
            />

            <input
              type="date"
              className="input"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />

            <select
              className="input"
              value={filters.minSeats}
              onChange={(e) =>
                setFilters({ ...filters, minSeats: e.target.value })
              }
            >
              <option value="1">1+ seats</option>
              <option value="2">2+ seats</option>
              <option value="3">3+ seats</option>
              <option value="4">4+ seats</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full md:w-auto">
            {loading ? 'Searching...' : 'Search Rides'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Searching for rides...</p>
        </div>
      ) : (
        <>
          {searched && (
            <p className="text-gray-600 mb-4">
              Found {rides.length} ride{rides.length !== 1 ? 's' : ''}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <Link
                key={ride._id}
                to={`/rides/${ride._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{ride.origin}</h3>
                    <p className="text-gray-600">to {ride.destination}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">
                    {ride.costPerPassenger} PKR
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium w-20">Date:</span>
                    <span>{new Date(ride.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Time:</span>
                    <span>{ride.time}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Seats:</span>
                    <span>{ride.availableSeats} available</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center">
                  <img
                    src={
                      ride.driver.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${ride.driver.name}`
                    }
                    alt={ride.driver.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{ride.driver.name}</p>
                    <p className="text-xs text-gray-500">
                      {ride.driver.university}
                      {ride.driver.driverRating?.average > 0 && (
                        <span className="ml-2">
                          ⭐ {ride.driver.driverRating.average.toFixed(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {searched && rides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No rides found. Try adjusting your filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchRides;
