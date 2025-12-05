import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import './AbsenceExcuseSubmission.css';

const AbsenceExcuseSubmission = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myExcuses, setMyExcuses] = useState([]);

  const [formData, setFormData] = useState({
    childId: '',
    absenceDate: '',
    reason: '',
    attachments: null,
  });

  // Fetch user's children on mount
  useEffect(() => {
    fetchChildren();
    fetchMyExcuses();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/children');
      
      // Filter children linked to this parent
      const myChildren = response.data.filter((child) =>
        child.parents?.some((parent) => parent._id === user._id)
      );
      
      setChildren(myChildren);
      setError('');
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyExcuses = async () => {
    try {
      const response = await api.get('/absence-excuses');
      setMyExcuses(response.data);
    } catch (err) {
      console.error('Error fetching excuses:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'attachments') {
      setFormData({ ...formData, attachments: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.childId) {
      setError('Please select a child');
      return false;
    }
    
    if (!formData.absenceDate) {
      setError('Please select absence date');
      return false;
    }
    
    const selectedDate = new Date(formData.absenceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (selectedDate > maxDate) {
      setError('Absence date cannot be more than 7 days in the future');
      return false;
    }
    
    if (!formData.reason || formData.reason.trim().length === 0) {
      setError('Please provide a reason for absence');
      return false;
    }
    
    if (formData.reason.length > 500) {
      setError('Reason must be less than 500 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const submitData = new FormData();
      submitData.append('childId', formData.childId);
      submitData.append('absenceDate', formData.absenceDate);
      submitData.append('reason', formData.reason);
      
      if (formData.attachments) {
        submitData.append('attachment', formData.attachments);
      }
      
      await api.post('/absence-excuses', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Absence excuse submitted successfully! Teacher will be notified.');
      
      // Reset form
      setFormData({
        childId: '',
        absenceDate: '',
        reason: '',
        attachments: null,
      });
      
      // Clear file input
      const fileInput = document.getElementById('attachment-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh excuses list
      fetchMyExcuses();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('Error submitting excuse:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit absence excuse. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (excuseId) => {
    if (!window.confirm('Are you sure you want to delete this excuse?')) {
      return;
    }
    
    try {
      await api.delete(`/absence-excuses/${excuseId}`);
      setSuccess('Excuse deleted successfully');
      fetchMyExcuses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting excuse:', err);
      setError(err.response?.data?.message || 'Failed to delete excuse');
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

  if (loading) {
    return <div className="absence-excuse-loading">Loading...</div>;
  }

  return (
    <div className="absence-excuse-container">
      <h2 className="page-title">Submit Absence Excuse</h2>
      
      {error && (
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
      
      <div className="absence-excuse-grid">
        {/* Submission Form */}
        <div className="excuse-form-card glass-card">
          <h3 className="card-title">New Excuse</h3>
          
          {children.length === 0 ? (
            <div className="no-children-message">
              <p>No children found linked to your account.</p>
              <p>Please contact administration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="excuse-form">
              <div className="form-group">
                <label htmlFor="childId" className="form-label">
                  Select Child <span className="required">*</span>
                </label>
                <select
                  id="childId"
                  name="childId"
                  value={formData.childId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Child --</option>
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="absenceDate" className="form-label">
                  Absence Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="absenceDate"
                  name="absenceDate"
                  value={formData.absenceDate}
                  onChange={handleChange}
                  className="form-input"
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]}
                  required
                />
                <small className="form-help">
                  Maximum 7 days in the future
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="reason" className="form-label">
                  Reason <span className="required">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  maxLength="500"
                  placeholder="Please provide details about the reason for absence..."
                  required
                ></textarea>
                <small className="form-help">
                  {formData.reason.length}/500 characters
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="attachment-input" className="form-label">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  id="attachment-input"
                  name="attachments"
                  onChange={handleChange}
                  className="form-file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <small className="form-help">
                  Medical certificate, letter, etc. (PDF, JPG, PNG, DOC)
                </small>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitLoading || children.length === 0}
              >
                {submitLoading ? 'Submitting...' : 'Submit Excuse'}
              </button>
            </form>
          )}
        </div>
        
        {/* My Excuses List */}
        <div className="excuse-list-card glass-card">
          <h3 className="card-title">My Submitted Excuses</h3>
          
          {myExcuses.length === 0 ? (
            <div className="no-excuses-message">
              <p>No excuses submitted yet.</p>
            </div>
          ) : (
            <div className="excuse-list">
              {myExcuses.map((excuse) => (
                <div key={excuse._id} className="excuse-item">
                  <div className="excuse-header">
                    <div className="excuse-child-name">
                      {excuse.child?.firstName} {excuse.child?.lastName}
                    </div>
                    <span className={getStatusBadgeClass(excuse.status)}>
                      {excuse.status}
                    </span>
                  </div>
                  
                  <div className="excuse-details">
                    <div className="excuse-date">
                      <strong>Date:</strong> {formatDate(excuse.absenceDate)}
                    </div>
                    <div className="excuse-reason">
                      <strong>Reason:</strong> {excuse.reason}
                    </div>
                    
                    {excuse.reviewNotes && (
                      <div className="excuse-review-notes">
                        <strong>Review Notes:</strong> {excuse.reviewNotes}
                      </div>
                    )}
                    
                    {excuse.reviewedBy && (
                      <div className="excuse-reviewed-by">
                        <strong>Reviewed by:</strong>{' '}
                        {excuse.reviewedBy.firstName} {excuse.reviewedBy.lastName}
                        {' on '}
                        {formatDate(excuse.reviewedAt)}
                      </div>
                    )}
                    
                    {excuse.attachments && excuse.attachments.length > 0 && (
                      <div className="excuse-attachments">
                        <strong>Attachments:</strong>
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
                    )}
                  </div>
                  
                  {excuse.status === 'pending' && (
                    <div className="excuse-actions">
                      <button
                        onClick={() => handleDelete(excuse._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsenceExcuseSubmission;
