import { useState, useEffect } from 'react';
import { enrollmentRequestAPI } from '../../api';
import Layout from '../../components/layout/Layout';
import { FiCheckCircle, FiClock, FiXCircle, FiEye } from 'react-icons/fi';

const EnrollmentRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter, search]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      
      const response = await enrollmentRequestAPI.getAll(params);
      // Axios interceptor already unwraps response.data, so response is the API response object
      // response.data contains the array of requests
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await enrollmentRequestAPI.getById(id);
      // Axios interceptor unwraps response.data, so response.data contains the actual request object
      setSelectedRequest(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleAccept = async (classId) => {
    try {
      const payload = classId ? { classId } : {};
      const response = await enrollmentRequestAPI.accept(selectedRequest._id, payload);
      
      // Check if temp password exists (for public requests)
      const tempPasswordMessage = response.tempPassword 
        ? `\n\nTemporary password: ${response.tempPassword}\n\nPlease send this to the parent's email.`
        : '';
      
      alert(`Application accepted!${tempPasswordMessage}`);
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to accept request');
    }
  };

  const handleReject = async (reason) => {
    try {
      await enrollmentRequestAPI.reject(selectedRequest._id, { rejectionReason: reason });
      alert('Application rejected successfully');
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const icons = {
      pending: <FiClock className="mr-1" />,
      accepted: <FiCheckCircle className="mr-1" />,
      rejected: <FiXCircle className="mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Requests</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by child name or parent email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No enrollment requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.child.firstName} {request.child.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {request.requestType === 'public' 
                            ? request.parentInfo?.email 
                            : request.parentId?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{request.requestType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleView(request._id)}
                          className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                        >
                          <FiEye className="mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setShowModal(false)}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </div>
    </Layout>
  );
};

const RequestDetailsModal = ({ request, onClose, onAccept, onReject }) => {
  const [action, setAction] = useState(null);
  const [classId, setClassId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Enrollment Request Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiXCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className="capitalize font-semibold">{request.status}</span>
          </div>

          {/* Child Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Child Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{request.child.firstName} {request.child.lastName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                  <p className="text-gray-900">{new Date(request.child.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Gender:</span>
                  <p className="text-gray-900">{request.child.gender}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Parent Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {request.requestType === 'public' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900">{request.parentInfo.firstName} {request.parentInfo.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{request.parentInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-gray-900">{request.parentInfo.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Relationship:</span>
                    <p className="text-gray-900 capitalize">{request.parentInfo.relationship}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-500">Address:</span>
                    <p className="text-gray-900">
                      {request.parentInfo.address?.street || 'N/A'}
                      {request.parentInfo.address?.city && `, ${request.parentInfo.address.city}`}
                      {request.parentInfo.address?.state && `, ${request.parentInfo.address.state}`}
                      {request.parentInfo.address?.zipCode && ` ${request.parentInfo.address.zipCode}`}
                      {request.parentInfo.address?.country && `, ${request.parentInfo.address.country}`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900">
                  {request.parentId?.name || 'Existing Parent'} ({request.parentId?.email})
                </p>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          {request.emergencyContacts && request.emergencyContacts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
              <div className="space-y-2">
                {request.emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{contact.name} ({contact.relationship})</p>
                    <p className="text-gray-600 text-sm">{contact.phone} • {contact.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {request.status === 'pending' && (
            <div className="border-t pt-6 space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setAction('accept')}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Accept Application
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Reject Application
                </button>
              </div>

              {action === 'accept' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Class (optional - will auto-assign by age if not selected)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Go to Classes page to copy a class ID, or leave empty for auto-assignment
                  </p>
                  <input
                    type="text"
                    placeholder="Paste class ID here or leave empty"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 font-mono text-sm"
                  />
                  <button
                    onClick={() => onAccept(classId || undefined)}
                    className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Confirm Accept
                  </button>
                </div>
              )}

              {action === 'reject' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                    placeholder="Please provide a reason for rejection..."
                  />
                  <button
                    onClick={() => onReject(rejectionReason)}
                    disabled={!rejectionReason.trim()}
                    className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {request.status === 'accepted' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">✓ Application Accepted</p>
              <p className="text-sm text-green-700 mt-1">
                Child Created: {request.createdChildId?.firstName} {request.createdChildId?.lastName}
              </p>
              {request.createdParentId && (
                <p className="text-sm text-green-700">
                  Parent Account Created: {request.createdParentId.email}
                </p>
              )}
            </div>
          )}

          {request.status === 'rejected' && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 font-medium">✗ Application Rejected</p>
              <p className="text-sm text-red-700 mt-1">Reason: {request.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentRequestList;
