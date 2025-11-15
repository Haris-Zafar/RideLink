import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllReports({ status: filter });
      setReports(data.data.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, status) => {
    const adminNotes = prompt('Enter admin notes (optional):');

    try {
      await adminApi.resolveReport(reportId, status, adminNotes || '');
      loadReports();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reports Management</h1>

      {/* Filters */}
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
          onClick={() => setFilter('under-review')}
          className={`btn ${
            filter === 'under-review' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Under Review
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`btn ${
            filter === 'resolved' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Resolved
        </button>
        <button
          onClick={() => setFilter('dismissed')}
          className={`btn ${
            filter === 'dismissed' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Dismissed
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <p className="text-center">Loading reports...</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      report.type === 'user'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {report.type.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-semibold mt-2 capitalize">
                    {report.reason.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Reported{' '}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded font-medium ${
                    report.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : report.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Reporter:</span>
                  <p className="text-sm">
                    {report.reporter.name} ({report.reporter.email})
                  </p>
                </div>

                {report.reportedUser && (
                  <div>
                    <span className="font-medium">Reported User:</span>
                    <p className="text-sm">
                      {report.reportedUser.name} (
                      {report.reportedUser.email})
                    </p>
                  </div>
                )}

                {report.reportedRide && (
                  <div>
                    <span className="font-medium">Reported Ride:</span>
                    <p className="text-sm">
                      {report.reportedRide.origin} →{' '}
                      {report.reportedRide.destination}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-gray-700 mt-1">
                    {report.description}
                  </p>
                </div>

                {report.adminNotes && (
                  <div className="bg-blue-50 p-3 rounded">
                    <span className="font-medium">Admin Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">
                      {report.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleResolve(report._id, 'resolved')}
                    className="btn btn-primary text-sm"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report._id, 'dismissed')}
                    className="btn btn-secondary text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No {filter} reports</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
