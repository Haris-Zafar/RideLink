import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../api/ridesApi';

const PostRide = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    availableSeats: 1,
    costPerPassenger: '',
    notes: '',
    nonSmoking: true,
    acAvailable: false,
    musicAllowed: true,
    petsAllowed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rideData = {
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        availableSeats: parseInt(formData.availableSeats),
        costPerPassenger: parseFloat(formData.costPerPassenger),
        notes: formData.notes,
        preferences: {
          nonSmoking: formData.nonSmoking,
          acAvailable: formData.acAvailable,
          musicAllowed: formData.musicAllowed,
          petsAllowed: formData.petsAllowed,
        },
      };

      await ridesApi.createRide(rideData);
      navigate('/rides/my-rides');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Post a Ride</h1>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              type="text"
              name="origin"
              required
              className="input"
              placeholder="e.g., DHA Phase 5, Lahore"
              value={formData.origin}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              required
              className="input"
              placeholder="e.g., LUMS University"
              value={formData.destination}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                className="input"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                required
                className="input"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats
              </label>
              <input
                type="number"
                name="availableSeats"
                required
                min="1"
                max="4"
                className="input"
                value={formData.availableSeats}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost per Passenger (PKR)
              </label>
              <input
                type="number"
                name="costPerPassenger"
                required
                min="0"
                step="10"
                className="input"
                value={formData.costPerPassenger}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="nonSmoking"
                  checked={formData.nonSmoking}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Non-smoking only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="acAvailable"
                  checked={formData.acAvailable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">AC available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="musicAllowed"
                  checked={formData.musicAllowed}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Music allowed</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="petsAllowed"
                  checked={formData.petsAllowed}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Pets allowed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              className="input"
              placeholder="Any additional information for passengers..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Post Ride'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRide;
