import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { staffAPI, userAPI } from '../../api';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiUserMinus, FiUserCheck, FiSearch, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const StaffList = ({ onSearchClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    position: 'teacher',
    employmentStatus: 'active',
    dateOfJoining: '',
    salary: {
      amount: '',
      currency: 'USD',
      paymentFrequency: 'monthly',
    },
    qualifications: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Auto-open modal from dashboard quick action
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data || []);
    } catch (error) {
      showAlert('error', 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      position: 'teacher',
      employmentStatus: 'active',
      dateOfJoining: '',
      salary: {
        amount: '',
        currency: 'USD',
        paymentFrequency: 'monthly',
      },
      qualifications: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showAlert('error', 'Please fill in all required fields');
      return;
    }
    
    if (!editingStaff && !formData.password) {
      showAlert('error', 'Password is required for new staff members');
      return;
    }
    
    try {
      if (editingStaff) {
        // For editing, only update staff profile
        const updateData = {
          position: formData.position,
          employmentStatus: formData.employmentStatus,
          dateOfJoining: formData.dateOfJoining,
          salary: formData.salary,
          qualifications: formData.qualifications,
          emergencyContact: formData.emergencyContact,
        };
        await staffAPI.update(editingStaff._id, updateData);
        showAlert('success', 'Staff member updated successfully');
      } else {
        // For creating new staff
        const staffData = {
          // User information
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone || '+0000000000',
          role: 'staff',
          // Staff profile information
          employeeId: `EMP${Date.now().toString().slice(-6)}`,
          position: formData.position,
          department: 'general',
          hireDate: formData.dateOfJoining || new Date().toISOString(),
          employmentType: 'full-time',
          employmentStatus: formData.employmentStatus,
          salary: {
            amount: parseFloat(formData.salary.amount) || 0,
            currency: formData.salary.currency || 'USD',
            payFrequency: formData.salary.paymentFrequency || 'monthly',
          },
        };
        
        // Only add emergencyContact if it has at least a name
        if (formData.emergencyContact?.name) {
          staffData.emergencyContact = {
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship || '',
            phone: formData.emergencyContact.phone || '',
          };
        }
        
        console.log('Sending staff data:', staffData);
        
        // Send to backend to create both user and staff profile
        const response = await api.post('/staff/create-with-user', staffData);
        console.log('Response:', response);
        
        if (response.data) {
          showAlert('success', 'Staff member added successfully');
        }
      }
      setShowAddModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to save staff member';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert('error', errorMessage);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.user?.firstName || '',
      lastName: staffMember.user?.lastName || '',
      email: staffMember.user?.email || '',
      phone: staffMember.user?.phone || '',
      password: '', // Don't populate password on edit
      position: staffMember.position || 'teacher',
      employmentStatus: staffMember.employmentStatus || 'active',
      dateOfJoining: staffMember.dateOfJoining?.split('T')[0] || '',
      salary: {
        amount: staffMember.salary?.amount || '',
        currency: staffMember.salary?.currency || 'USD',
        paymentFrequency: staffMember.salary?.paymentFrequency || 'monthly',
      },
      qualifications: staffMember.qualifications || '',
      emergencyContact: staffMember.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
      },
    });
    setShowAddModal(true);
  };

  const handleDeactivate = async (staffId, userId) => {
    if (!window.confirm('Deactivate this staff account? They will not be able to log in.')) return;
    try {
      await userAPI.deactivate(userId);
      showAlert('success', 'Staff member deactivated successfully');
      fetchStaff();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to deactivate staff member');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await userAPI.activate(userId);
      showAlert('success', 'Staff member activated successfully');
      fetchStaff();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to activate staff member');
    }
  };

  const filteredStaff = staff.filter(s => {
    const fullName = `${s.user?.firstName} ${s.user?.lastName}`.toLowerCase();
    const position = s.position?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || position.includes(search);
  });

  const positionBadgeColor = (position) => {
    const colors = {
      'teacher': 'bg-blue-100 text-blue-800',
      'assistant': 'bg-green-100 text-green-800',
      'manager': 'bg-purple-100 text-purple-800',
      'nurse': 'bg-pink-100 text-pink-800',
      'receptionist': 'bg-orange-100 text-orange-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  const statusBadgeColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">{staff.length} staff members registered</p>
          </div>
          {user?.role === 'admin' && (
            <Button icon={FiPlus} onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}>
              Add New Staff Member
            </Button>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Search */}
        <Card>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </Card>

        {/* Staff List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
              {user?.role === 'admin' && (
                <div className="mt-6">
                  <Button icon={FiPlus} onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}>
                    Add New Staff Member
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((staffMember) => (
              <Card key={staffMember._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {staffMember.user?.firstName} {staffMember.user?.lastName}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${positionBadgeColor(staffMember.position)}`}>
                        {staffMember.position}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staffMember.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {staffMember.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/staff/${staffMember._id}`}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Profile"
                      >
                        <FiUser className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      {staffMember.user?.isActive ? (
                        <button
                          onClick={() => handleDeactivate(staffMember._id, staffMember.user?._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Deactivate"
                        >
                          <FiUserMinus className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(staffMember.user?._id)}
                          className="text-green-600 hover:text-green-700"
                          title="Activate"
                        >
                          <FiUserCheck className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {staffMember.user?.email && (
                    <div className="flex items-center text-gray-600">
                      <FiMail className="h-4 w-4 mr-2" />
                      <span className="truncate">{staffMember.user.email}</span>
                    </div>
                  )}
                  {staffMember.user?.phone && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="h-4 w-4 mr-2" />
                      <span>{staffMember.user.phone}</span>
                    </div>
                  )}
                  {staffMember.dateOfJoining && (
                    <div className="text-gray-500 mt-2">
                      <span className="font-medium">Joined:</span> {new Date(staffMember.dateOfJoining).toLocaleDateString()}
                    </div>
                  )}
                  {staffMember.salary?.amount && (
                    <div className="text-gray-500">
                      <span className="font-medium">Salary:</span> {staffMember.salary.currency} {staffMember.salary.amount}/{staffMember.salary.paymentFrequency}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingStaff}
                  className="input-field disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              {!editingStaff && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingStaff}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Position</option>
                  <option value="teacher">Teacher</option>
                  <option value="assistant">Assistant Teacher</option>
                  <option value="manager">Manager</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Amount
                </label>
                <input
                  type="number"
                  name="salary.amount"
                  value={formData.salary.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., 3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  name="salary.paymentFrequency"
                  value={formData.salary.paymentFrequency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                rows="2"
                className="input-field"
                placeholder="Educational background, certifications..."
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default StaffList;
