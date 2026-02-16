import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiFileText, FiFilter } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { absenceExcuseAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AbsenceExcusesPage = ({ onSearchClick }) => {
  const { user } = useAuth();
  const [excuses, setExcuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [alert, setAlert] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedExcuse, setSelectedExcuse] = useState(null);
  const [reviewData, setReviewData] = useState({ status: 'approved', notes: '' });

  useEffect(() => {
    fetchExcuses();
  }, [filter]);

  const fetchExcuses = async () => {
    try {
      setLoading(true);
      const response = await absenceExcuseAPI.getAll();
      let data = response.data?.data || response.data || [];
      
      // Filter based on selection
      if (filter !== 'all') {
        data = data.filter(e => e.status === filter);
      }
      
      setExcuses(data);
    } catch (error) {
      console.error('Failed to fetch excuses:', error);
      showAlert('error', 'Failed to load absence excuses');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleReviewClick = (excuse) => {
    setSelectedExcuse(excuse);
    setReviewData({ status: 'approve', notes: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        action: reviewData.status,
        reviewNotes: reviewData.notes
      };
      console.log('🔍 Submitting review with payload:', payload);
      
      await absenceExcuseAPI.review(selectedExcuse._id, payload);
      
      showAlert('success', `Excuse ${reviewData.status}d successfully`);
      setShowReviewModal(false);
      fetchExcuses();
    } catch (error) {
      console.error('Failed to review excuse:', error);
      showAlert('error', error.response?.data?.message || 'Failed to review excuse');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getReasonDisplay = (reason) => {
    const reasons = {
      illness: '🤒 Illness',
      medical_appointment: '👨‍⚕️ Medical Appointment',
      family_emergency: '🚨 Family Emergency',
      travel: '✈️ Travel',
      religious_observance: '🕌 Religious Observance',
      other: 'Other'
    };
    return reasons[reason] || reason;
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Absence Excuses</h1>
            <p className="text-gray-600 mt-1">Review and manage absence excuse requests</p>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Filter */}
        <Card>
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Excuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Excuses List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : excuses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No excuses found</h3>
              <p className="text-gray-600 mt-1">No {filter === 'all' ? '' : filter + ' '} absence excuses to review</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {excuses.map((excuse) => (
              <Card key={excuse._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {excuse.child?.firstName} {excuse.child?.lastName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(excuse.status)}`}>
                        {excuse.status.charAt(0).toUpperCase() + excuse.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Date:</span> {new Date(excuse.absenceDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {getReasonDisplay(excuse.reason)}
                      </p>
                      <p>
                        <span className="font-medium">Description:</span> {excuse.description}
                      </p>
                      <p>
                        <span className="font-medium">Submitted by:</span> {excuse.submittedBy?.firstName} {excuse.submittedBy?.lastName}
                      </p>
                      {excuse.reviewNotes && (
                        <p>
                          <span className="font-medium">Review Notes:</span> {excuse.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {excuse.status === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={FiCheck}
                      onClick={() => handleReviewClick(excuse)}
                      className="ml-4"
                    >
                      Review
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedExcuse(null);
          }}
          title="Review Absence Excuse"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Reviewing excuse for <span className="font-semibold">{selectedExcuse?.child?.firstName} {selectedExcuse?.child?.lastName}</span>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Excuse Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Reason:</strong> {getReasonDisplay(selectedExcuse?.reason)}</p>
                <p><strong>Date:</strong> {selectedExcuse?.absenceDate && new Date(selectedExcuse.absenceDate).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {selectedExcuse?.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="approve"
                    checked={reviewData.status === 'approve'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">✓ Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="reject"
                    checked={reviewData.status === 'reject'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">✗ Reject</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={reviewData.notes}
                onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Add any notes about your decision..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedExcuse(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {reviewData.status === 'approve' ? 'Approve' : 'Reject'} Excuse
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AbsenceExcusesPage;
