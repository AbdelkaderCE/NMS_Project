import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { childrenAPI, classAPI, groupAPI } from '../../api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ChildrenList = ({ onSearchClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    parentId: '',
    assignedClass: '',
    assignedGroup: '',
    medicalInfo: '',
    allergies: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });
  const [parentFormData, setParentFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchChildren();
    // Only admin/manager/receptionist need parent list for assigning during create/edit
    if (user?.role === 'admin' || (user?.role === 'staff' && ['manager', 'receptionist'].includes(user?.staffInfo?.position))) {
      fetchParents();
    }
    fetchClasses();
  }, []);

  // Auto-open modal from dashboard quick action
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchChildren = async () => {
    try {
      const response = await childrenAPI.getAll();
      setChildren(response.data || []);
    } catch (error) {
      showAlert('error', 'Failed to fetch children');
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      // Import userAPI at the top
      const { userAPI } = await import('../../api');
      const response = await userAPI.getByRole('parent');
      setParents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
      // Don't show error alert - parents list is optional
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchGroupsByClass = async (classId) => {
    if (!classId) {
      setGroups([]);
      return;
    }
    try {
      const response = await groupAPI.getAll({ class: classId });
      setGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
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
      dateOfBirth: '',
      gender: 'male',
      parentId: '',
      assignedClass: '',
      assignedGroup: '',
      medicalInfo: '',
      allergies: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    });
    setEditingChild(null);
    setGroups([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChild) {
        // Prepare data for update
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        };

        // Add class and group assignments
        if (formData.assignedClass) {
          updateData.assignedClass = formData.assignedClass;
        }
        if (formData.assignedGroup) {
          updateData.assignedGroup = formData.assignedGroup;
        }

        // Add parent if specified
        if (formData.parentId) {
          updateData.parents = [{
            parent: formData.parentId,
            relationship: 'guardian',
            isPrimary: true
          }];
        }

        // Only add emergencyContacts if name exists
        if (formData.emergencyContact?.name) {
          updateData.emergencyContacts = [{
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship || 'guardian',
            phone: formData.emergencyContact.phone || '',
            isPrimary: true
          }];
        }

        // Only add medicalInfo if it has content
        if (formData.medicalInfo || formData.allergies) {
          updateData.medicalInfo = {};
          if (formData.medicalInfo) {
            updateData.medicalInfo.conditions = [formData.medicalInfo];
          }
          if (formData.allergies) {
            updateData.medicalInfo.allergies = [{
              name: formData.allergies,
              severity: 'moderate'
            }];
          }
        }

        await childrenAPI.update(editingChild._id, updateData);
        showAlert('success', 'Child updated successfully');
      } else {
        // Prepare data for creation - match backend model structure
        const childData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          // Parents array is required - use selected parent or logged-in user
          parents: [{
            parent: formData.parentId || user._id,
            relationship: 'guardian',
            isPrimary: true
          }]
        };
        
        // Add class and group assignments
        if (formData.assignedClass) {
          childData.assignedClass = formData.assignedClass;
        }
        if (formData.assignedGroup) {
          childData.assignedGroup = formData.assignedGroup;
        }
        
        // Only add emergencyContacts if name exists
        if (formData.emergencyContact?.name) {
          childData.emergencyContacts = [{
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship || 'guardian',
            phone: formData.emergencyContact.phone || '',
            isPrimary: true
          }];
        }
        
        // Only add medicalInfo if it has content
        if (formData.medicalInfo) {
          childData.medicalInfo = {
            conditions: formData.medicalInfo ? [formData.medicalInfo] : []
          };
        }
        
        // Only add allergies if it has content
        if (formData.allergies) {
          if (!childData.medicalInfo) childData.medicalInfo = {};
          childData.medicalInfo.allergies = [{
            name: formData.allergies,
            severity: 'moderate'
          }];
        }
        
        console.log('Sending child data:', childData);
        
        await childrenAPI.create(childData);
        showAlert('success', 'Child added successfully');
      }
      setShowAddModal(false);
      resetForm();
      fetchChildren();
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      showAlert('error', error.response?.data?.message || error.message || 'Failed to save child');
    }
  };

  const handleEdit = (child) => {
    setEditingChild(child);
    const classId = child.assignedClass?._id || child.assignedClass || '';
    setFormData({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth?.split('T')[0] || '',
      gender: child.gender,
      parentId: child.parents?.[0]?.parent?._id || child.parents?.[0]?.parent || '',
      assignedClass: classId,
      assignedGroup: child.assignedGroup?._id || child.assignedGroup || '',
      medicalInfo: child.medicalInfo?.conditions?.[0] || child.medicalInfo?.conditions?.join(', ') || '',
      allergies: child.medicalInfo?.allergies?.[0]?.name || '',
      emergencyContact: child.emergencyContacts?.[0] || {
        name: '',
        relationship: '',
        phone: '',
      },
    });
    if (classId) {
      fetchGroupsByClass(classId);
    }
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this child?')) return;
    
    try {
      await childrenAPI.delete(id);
      showAlert('success', 'Child deleted successfully');
      fetchChildren();
    } catch (error) {
      showAlert('error', 'Failed to delete child');
    }
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    try {
      const { authAPI } = await import('../../api');
      const response = await authAPI.register({
        ...parentFormData,
        role: 'parent',
      });
      showAlert('success', 'Parent created successfully!');
      setShowParentModal(false);
      setParentFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
      });
      // Refresh parents list and auto-select the new parent
      await fetchParents();
      // Set the newly created parent as selected
      if (response.data?._id) {
        setFormData({ ...formData, parentId: response.data._id });
      }
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to create parent');
    }
  };

  const filteredChildren = children.filter(child =>
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Children Management</h1>
            <p className="text-gray-600 mt-1">{children.length} children registered</p>
          </div>
          {/* Only admin and manager can add children - teachers/assistants can only view */}
          {(user?.role === 'admin' || (user?.role === 'staff' && ['manager', 'receptionist'].includes(user?.staffInfo?.position))) && (
            <Button icon={FiPlus} onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}>
              Add New Child
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
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </Card>

        {/* Children List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredChildren.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No children found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new child.</p>
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <div className="mt-6">
                  <Button icon={FiPlus} onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}>
                    Add New Child
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChildren.map((child) => (
              <Card key={child._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Age: {calculateAge(child.dateOfBirth)} years • {child.gender}
                    </p>
                    {/* Class and Group Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {child.assignedClass && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {child.assignedClass.name}
                        </span>
                      )}
                      {child.assignedGroup && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {child.assignedGroup.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/children/${child._id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="View Profile"
                    >
                      <FiUser className="h-4 w-4" />
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <>
                        <button
                          onClick={() => handleEdit(child)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(child._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {child.allergies && (
                    <div>
                      <span className="font-medium text-gray-700">Allergies:</span>
                      <span className="text-gray-600 ml-2">{child.allergies}</span>
                    </div>
                  )}
                  {child.emergencyContact?.name && (
                    <div>
                      <span className="font-medium text-gray-700">Emergency Contact:</span>
                      <span className="text-gray-600 ml-2">{child.emergencyContact.name}</span>
                    </div>
                  )}
                  {child.emergencyContact?.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-600 ml-2">{child.emergencyContact.phone}</span>
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
          title={editingChild ? 'Edit Child' : 'Add New Child'}
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
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Class Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Class
                </label>
                <select
                  name="assignedClass"
                  value={formData.assignedClass}
                  onChange={(e) => {
                    setFormData({ ...formData, assignedClass: e.target.value, assignedGroup: '' });
                    fetchGroupsByClass(e.target.value);
                  }}
                  className="input-field"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Group
                </label>
                <select
                  name="assignedGroup"
                  value={formData.assignedGroup}
                  onChange={(e) => setFormData({ ...formData, assignedGroup: e.target.value })}
                  disabled={!formData.assignedClass}
                  className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.assignedClass ? 'Select a class first' : 'Select a group'}
                  </option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.childrenCount || 0}/{group.maxCapacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent Selection - Show for both create and edit */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent/Guardian {!editingChild && parents.length > 0 && <span className="text-red-500">*</span>}
                  </label>
                  {!editingChild && (
                    <button
                      type="button"
                      onClick={() => setShowParentModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Create New Parent
                    </button>
                  )}
                </div>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  required={!editingChild && parents.length > 0}
                  className="input-field"
                >
                  <option value="">
                    {parents.length === 0 ? 'No parent users available - Click "Create New Parent"' : editingChild ? 'Keep current parent' : 'Select a parent'}
                  </option>
                  {parents.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.firstName} {parent.lastName} ({parent.email})
                    </option>
                  ))}
                </select>
                {!editingChild && parents.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No parent users found. Click "Create New Parent" above to add one.
                  </p>
                )}
                {editingChild && (
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to keep current parent assignment.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows="2"
                className="input-field"
                placeholder="Any known allergies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Information
              </label>
              <textarea
                name="medicalInfo"
                value={formData.medicalInfo}
                onChange={handleInputChange}
                rows="2"
                className="input-field"
                placeholder="Any medical conditions or notes..."
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
                    placeholder="e.g., Mother, Father"
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
                {editingChild ? 'Update Child' : 'Add Child'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Create Parent Modal */}
        <Modal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          title="Create New Parent"
        >
          <form onSubmit={handleCreateParent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={parentFormData.firstName}
                  onChange={(e) => setParentFormData({ ...parentFormData, firstName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={parentFormData.lastName}
                  onChange={(e) => setParentFormData({ ...parentFormData, lastName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={parentFormData.email}
                onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={parentFormData.password}
                onChange={(e) => setParentFormData({ ...parentFormData, password: e.target.value })}
                className="input-field"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={parentFormData.phone}
                onChange={(e) => setParentFormData({ ...parentFormData, phone: e.target.value })}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                This parent account will be created and automatically selected for the child.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowParentModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Parent</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ChildrenList;
