/**
 * ChildrenList Component with Class-Based Filtering
 * Displays children with respect to teacher's assigned classes
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './ChildrenList.css';

export default function ChildrenList() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byClass: {},
    message: '',
  });

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/children');

      if (response.data.success) {
        const childrenData = response.data.data;
        setChildren(childrenData);
        setFilteredChildren(childrenData);

        // Calculate stats
        const byClass = {};
        childrenData.forEach((child) => {
          const className = child.assignedClass?.name || 'Unassigned';
          byClass[className] = (byClass[className] || 0) + 1;
        });

        setStats({
          total: childrenData.length,
          byClass,
          message: response.data.pagination?.message || '',
        });

        // Extract unique classes
        const uniqueClasses = [
          ...new Set(
            childrenData
              .filter((c) => c.assignedClass)
              .map((c) => c.assignedClass.name)
          ),
        ];
        setClasses(uniqueClasses);
      } else {
        setError(response.data.message || 'Failed to fetch children');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this data');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch children');
      }
      setChildren([]);
      setFilteredChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterChildren(term, selectedClass);
  };

  const handleClassFilter = (className) => {
    setSelectedClass(className);
    filterChildren(searchTerm, className);
  };

  const filterChildren = (term, className) => {
    let filtered = children;

    // Filter by class
    if (className !== 'all') {
      filtered = filtered.filter(
        (child) => child.assignedClass?.name === className
      );
    }

    // Filter by search term
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (child) =>
          child.firstName.toLowerCase().includes(lowerTerm) ||
          child.lastName.toLowerCase().includes(lowerTerm) ||
          child.email?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredChildren(filtered);
  };

  if (loading) {
    return (
      <div className="children-list loading">
        <div className="spinner"></div>
        <p>Loading children data...</p>
      </div>
    );
  }

  return (
    <div className="children-list">
      <div className="children-header">
        <h1>Children Management</h1>
        <p className="subtitle">
          {user?.role === 'staff'
            ? `${user?.staffInfo?.position} - Class-Based View`
            : user?.role === 'parent'
            ? 'Your Children'
            : 'All Children'}
        </p>
      </div>

      {/* Stats Card */}
      {children.length > 0 && (
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-label">Total Children</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          {Object.entries(stats.byClass).map(([className, count]) => (
            <div key={className} className="stat-item">
              <span className="stat-label">{className}</span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <div>
            <strong>Access Notice</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!error && children.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Children Available</h2>
          <p>
            {user?.role === 'staff'
              ? 'You have not been assigned to any classes yet. Please contact your administrator.'
              : 'No children assigned to your account.'}
          </p>
        </div>
      )}

      {/* Filters */}
      {children.length > 0 && (
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {classes.length > 1 && user?.role === 'staff' && (
            <div className="class-filter">
              <button
                className={`filter-btn ${selectedClass === 'all' ? 'active' : ''}`}
                onClick={() => handleClassFilter('all')}
              >
                All Classes ({children.length})
              </button>
              {classes.map((className) => (
                <button
                  key={className}
                  className={`filter-btn ${selectedClass === className ? 'active' : ''}`}
                  onClick={() => handleClassFilter(className)}
                >
                  {className} ({stats.byClass[className] || 0})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Children Grid */}
      {filteredChildren.length > 0 && (
        <div className="children-grid">
          {filteredChildren.map((child) => (
            <div key={child._id} className="child-card">
              <div className="child-image">
                <img
                  src={child.photo || 'https://via.placeholder.com/100'}
                  alt={`${child.firstName} ${child.lastName}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100';
                  }}
                />
              </div>

              <div className="child-info">
                <h3>
                  {child.firstName} {child.lastName}
                </h3>
                <p className="child-age">
                  {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years old
                </p>

                {child.assignedClass && (
                  <p className="child-class">
                    <span className="class-badge">{child.assignedClass.name}</span>
                  </p>
                )}

                {child.parents && child.parents.length > 0 && (
                  <p className="child-parents">
                    Parents: {child.parents.length}
                  </p>
                )}
              </div>

              <div className="child-actions">
                <button className="btn-view" title="View Details">
                  👁️ View
                </button>
                <button className="btn-attendance" title="View Attendance">
                  📋 Attendance
                </button>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <button className="btn-edit" title="Edit">
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && filteredChildren.length === 0 && (
        <div className="no-results">
          <p>No children found matching "{searchTerm}"</p>
          <button
            className="btn-reset"
            onClick={() => handleSearch('')}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Data Isolation Notice for Teachers */}
      {user?.role === 'staff' && children.length > 0 && (
        <div className="info-notice">
          <span className="info-icon">ℹ️</span>
          <p>
            Showing children only from your assigned classes. This is class-level data isolation
            for data security and privacy.
          </p>
        </div>
      )}
    </div>
  );
}
