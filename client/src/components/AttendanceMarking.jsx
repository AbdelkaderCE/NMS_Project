/**
 * AttendanceMarking Component with Class-Based Access Control
 * Allows teachers to mark attendance only for children in their assigned classes
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AttendanceMarking.css';

export default function AttendanceMarking() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({
    status: 'PRESENT',
    temperature: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (user?.role === 'staff') {
      fetchChildren();
      fetchAttendanceList();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/children');
      if (response.data.success) {
        setChildren(response.data.data);
      } else {
        setError('Failed to fetch children');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to access children data');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch children');
      }
    }
  };

  const fetchAttendanceList = async () => {
    try {
      const response = await api.get('/attendance', {
        params: {
          startDate: new Date(new Date().setDate(new Date().getDate() - 7))
            .toISOString()
            .split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        },
      });
      if (response.data.success) {
        setAttendanceList(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch attendance list:', err);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setError(null);
    setSuccess(false);
  };

  const handleAttendanceChange = (field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();

    if (!selectedChild) {
      setError('Please select a child');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await api.post('/attendance', {
        child: selectedChild._id,
        date: selectedDate,
        status: attendance.status,
        temperature: attendance.temperature ? parseFloat(attendance.temperature) : undefined,
        notes: attendance.notes,
      });

      if (response.data.success) {
        setSuccess(true);
        setAttendance({
          status: 'PRESENT',
          temperature: '',
          notes: '',
        });
        setSelectedChild(null);
        fetchAttendanceList();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This child is not in any of your assigned classes');
      } else {
        setError(err.response?.data?.message || 'Failed to mark attendance');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (attendanceId) => {
    try {
      setLoading(true);
      const response = await api.post(`/attendance/${attendanceId}/check-in`, {
        temperature: 37.5,
      });

      if (response.data.success) {
        setSuccess(true);
        fetchAttendanceList();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You cannot check in this child');
      } else {
        setError(err.response?.data?.message || 'Failed to check in');
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      setLoading(true);
      const response = await api.post(`/attendance/${attendanceId}/check-out`);

      if (response.data.success) {
        setSuccess(true);
        fetchAttendanceList();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You cannot check out this child');
      } else {
        setError(err.response?.data?.message || 'Failed to check out');
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'staff') {
    return (
      <div className="attendance-marking">
        <div className="access-denied">
          <p>⛔ Only staff members can access this feature</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-marking">
      <div className="attendance-container">
        <div className="attendance-header">
          <h1>📋 Attendance Management</h1>
          <p className="subtitle">Mark attendance for children in your assigned classes</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div>
              <strong>Success</strong>
              <p>Operation completed successfully</p>
            </div>
          </div>
        )}

        {children.length === 0 && (
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <div>
              <p>No children available in your assigned classes</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="attendance-tabs">
          <button
            className={`tab-btn ${!showList ? 'active' : ''}`}
            onClick={() => setShowList(false)}
          >
            📝 Mark Attendance
          </button>
          <button
            className={`tab-btn ${showList ? 'active' : ''}`}
            onClick={() => setShowList(true)}
          >
            📊 Attendance List
          </button>
        </div>

        {/* Mark Attendance Form */}
        {!showList && (
          <div className="mark-attendance-section">
            <div className="form-group">
              <label>Select Child</label>
              <div className="children-list-compact">
                {children.length === 0 ? (
                  <p className="no-children">No children available</p>
                ) : (
                  children.map((child) => (
                    <button
                      key={child._id}
                      className={`child-btn ${selectedChild?._id === child._id ? 'selected' : ''}`}
                      onClick={() => handleChildSelect(child)}
                    >
                      <div className="child-name">
                        {child.firstName} {child.lastName}
                      </div>
                      <div className="child-class">
                        {child.assignedClass?.name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedChild && (
              <form className="attendance-form" onSubmit={handleMarkAttendance}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={attendance.status}
                      onChange={(e) => handleAttendanceChange('status', e.target.value)}
                      className="form-input"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                      <option value="SICK">Sick Leave</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={attendance.temperature}
                    onChange={(e) => handleAttendanceChange('temperature', e.target.value)}
                    placeholder="37.5"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={attendance.notes}
                    onChange={(e) => handleAttendanceChange('notes', e.target.value)}
                    placeholder="Add any notes about the child..."
                    className="form-input"
                    rows="3"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? '⏳ Marking...' : '✅ Mark Attendance'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Attendance List */}
        {showList && (
          <div className="attendance-list-section">
            {attendanceList.length === 0 ? (
              <div className="empty-list">
                <p>No attendance records found</p>
              </div>
            ) : (
              <div className="attendance-table">
                <div className="table-header">
                  <div className="col-child">Child</div>
                  <div className="col-date">Date</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>
                {attendanceList.map((att) => (
                  <div key={att._id} className="table-row">
                    <div className="col-child">
                      {att.child?.firstName} {att.child?.lastName}
                    </div>
                    <div className="col-date">
                      {new Date(att.date).toLocaleDateString()}
                    </div>
                    <div className="col-status">
                      <span className={`status-badge status-${att.status.toLowerCase()}`}>
                        {att.status}
                      </span>
                    </div>
                    <div className="col-actions">
                      {!att.checkInTime && (
                        <button
                          className="btn-action btn-check-in"
                          onClick={() => handleCheckIn(att._id)}
                          disabled={loading}
                          title="Check In"
                        >
                          🚪 In
                        </button>
                      )}
                      {att.checkInTime && !att.checkOutTime && (
                        <button
                          className="btn-action btn-check-out"
                          onClick={() => handleCheckOut(att._id)}
                          disabled={loading}
                          title="Check Out"
                        >
                          🚶 Out
                        </button>
                      )}
                      {att.checkInTime && att.checkOutTime && (
                        <span className="completed">✅ Complete</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Isolation Notice */}
        {children.length > 0 && (
          <div className="isolation-notice">
            <span className="notice-icon">🔒</span>
            <p>
              You can only see and manage children from your assigned classes.
              This is class-level data isolation for data security.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
