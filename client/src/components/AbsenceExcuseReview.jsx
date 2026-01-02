import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AbsenceExcuseReview.css';

const AbsenceExcuseReview = () => {
  const { user } = useAuth();
  const [excuses, setExcuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedExcuse, setSelectedExcuse] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'pending',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchExcuses();
  }, [filters]);

  const fetchExcuses = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query string
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const endpoint =
        filters.status === 'pending'
          ? '/absence-excuses/pending'
          : `/absence-excuses?${params.toString()}`;
      
      const response = await api.get(endpoint);
      setExcuses(response.data);
    } catch (err) {
      console.error('Error fetching excuses:', err);
      setError('Failed to load absence excuses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const openReviewModal = (excuse, action) => {
    setSelectedExcuse(excuse);
    setReviewAction(action);
    setReviewNotes('');
    setError('');
  };

  const closeReviewModal = () => {
    setSelectedExcuse(null);
    setReviewAction('');
    setReviewNotes('');
  };

  const handleReview = async () => {
    if (!reviewNotes || reviewNotes.trim().length === 0) {
      setError('Please provide review notes');
      return;
    }
    
    if (reviewNotes.length > 500) {
      setError('Review notes must be less than 500 characters');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await api.put(`/absence-excuses/${selectedExcuse._id}/review`, {
        action: reviewAction,
        reviewNotes,
      });
      
      setSuccess(
        `Excuse ${reviewAction}ed successfully! Parent has been notified.`
      );
      
      // Refresh list
      fetchExcuses();
      
      // Close modal
      closeReviewModal();
      
      // Clear success after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('Error reviewing excuse:', err);
      setError(
        err.response?.data?.message || 
        `Failed to ${reviewAction} excuse. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge status-approved';
      case 'rejected':
        return 'status-badge status-rejected';
      case 'pending':
      default:
        return 'status-badge status-pending';
    }
  };

  const getDaysAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="absence-review-container">
      <h2 className="page-title">Review Absence Excuses</h2>
      
      {error && !selectedExcuse && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          {success}
        </div>
      )}
      
      {/* Filters */}
      <div className="filters-card glass-card">
        <h3 className="card-subtitle">Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="status" className="filter-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="startDate" className="filter-label">
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate" className="filter-label">
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>
      </div>
      
      {/* Excuses List */}
      <div className="excuses-list-card glass-card">
        <h3 className="card-subtitle">
          {filters.status === 'pending' ? 'Pending' : 'All'} Excuses
          <span className="count-badge">{excuses.length}</span>
        </h3>
        
        {loading ? (
          <div className="loading-state">Loading excuses...</div>
        ) : excuses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No excuses found</p>
            {filters.status === 'pending' && (
              <small>All caught up! No pending excuses to review.</small>
            )}
          </div>
        ) : (
          <div className="excuses-grid">
            {excuses.map((excuse) => (
              <div key={excuse._id} className="excuse-card">
                <div className="excuse-card-header">
                  <div className="excuse-info">
                    <h4 className="child-name">
                      {excuse.child?.firstName} {excuse.child?.lastName}
                    </h4>
                    <div className="class-name">
                      Class: {excuse.child?.class?.name || 'N/A'}
                    </div>
                  </div>
                  <span className={getStatusBadgeClass(excuse.status)}>
                    {excuse.status}
                  </span>
                </div>
                
                <div className="excuse-card-body">
                  <div className="info-row">
                    <span className="info-label">Absence Date:</span>
                    <span className="info-value">
                      {formatDate(excuse.absenceDate)}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Submitted:</span>
                    <span className="info-value">
                      {getDaysAgo(excuse.createdAt)}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Submitted By:</span>
                    <span className="info-value">
                      {excuse.submittedBy?.firstName}{' '}
                      {excuse.submittedBy?.lastName}
                    </span>
                  </div>
                  
                  <div className="reason-section">
                    <span className="info-label">Reason:</span>
                    <p className="reason-text">{excuse.reason}</p>
                  </div>
                  
                  {excuse.attachments && excuse.attachments.length > 0 && (
                    <div className="attachments-section">
                      <span className="info-label">Attachments:</span>
                      <div className="attachments-list">
                        {excuse.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            📎 {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {excuse.reviewNotes && (
                    <div className="review-notes-section">
                      <span className="info-label">Review Notes:</span>
                      <p className="review-notes-text">{excuse.reviewNotes}</p>
                      {excuse.reviewedBy && (
                        <small className="reviewed-by-text">
                          By {excuse.reviewedBy.firstName}{' '}
                          {excuse.reviewedBy.lastName} on{' '}
                          {formatDate(excuse.reviewedAt)}
                        </small>
                      )}
                    </div>
                  )}
                </div>
                
                {excuse.status === 'pending' && (
                  <div className="excuse-card-actions">
                    <button
                      onClick={() => openReviewModal(excuse, 'approve')}
                      className="btn btn-success"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => openReviewModal(excuse, 'reject')}
                      className="btn btn-danger"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Review Modal */}
      {selectedExcuse && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Excuse
              </h3>
              <button onClick={closeReviewModal} className="modal-close">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-excuse-info">
                <p>
                  <strong>Child:</strong> {selectedExcuse.child?.firstName}{' '}
                  {selectedExcuse.child?.lastName}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {formatDate(selectedExcuse.absenceDate)}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedExcuse.reason}
                </p>
              </div>
              
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="reviewNotes" className="form-label">
                  Review Notes <span className="required">*</span>
                </label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="form-textarea"
                  rows="4"
                  maxLength="500"
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Add any notes for the parent (e.g., "Approved. Thank you for notifying us.")'
                      : 'Please explain why this excuse is being rejected...'
                  }
                  required
                ></textarea>
                <small className="form-help">
                  {reviewNotes.length}/500 characters
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeReviewModal}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className={`btn ${
                  reviewAction === 'approve' ? 'btn-success' : 'btn-danger'
                }`}
                disabled={submitting}
              >
                {submitting
                  ? 'Submitting...'
                  : reviewAction === 'approve'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceExcuseReview;
