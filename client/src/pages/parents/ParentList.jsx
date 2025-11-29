import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiUserMinus, FiUserCheck, FiSearch, FiMail, FiPhone, FiUser, FiKey } from 'react-icons/fi';
import { userAPI, authAPI } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Layout from '../../components/layout/Layout';

const ParentList = ({ onSearchClick }) => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getByRole('parent');
      setParents(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parents:', error);
      setAlert({ type: 'error', message: 'Failed to load parents' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        // Update existing parent
        await userAPI.update(editingParent._id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
        });
        setAlert({ type: 'success', message: 'Parent updated successfully!' });
      } else {
        // Create new parent
        const parentData = {
          ...formData,
          role: 'parent',
        };
        await authAPI.register(parentData);
        setAlert({ type: 'success', message: 'Parent created successfully!' });
      }
      setShowModal(false);
      resetForm();
      fetchParents();
    } catch (error) {
      console.error('Error saving parent:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to save parent' 
      });
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this parent account? They will not be able to log in.')) return;

    try {
      await userAPI.deactivate(id);
      setAlert({ type: 'success', message: 'Parent deactivated successfully!' });
      fetchParents();
    } catch (error) {
      console.error('Error deactivating parent:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to deactivate parent' });
    }
  };

  const handleActivate = async (id) => {
    try {
      await userAPI.activate(id);
      setAlert({ type: 'success', message: 'Parent activated successfully!' });
      fetchParents();
    } catch (error) {
      console.error('Error activating parent:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to activate parent' });
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      email: parent.email || '',
      password: '',
      phone: parent.phone || '',
      address: parent.address || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    });
    setEditingParent(null);
  };

  const handleResetPassword = async (parent) => {
    if (!window.confirm(`Reset password for ${parent.firstName} ${parent.lastName}?`)) return;

    try {
      const response = await authAPI.resetParentPassword(parent._id);
      const tempPassword = response.data?.tempPassword || response.tempPassword;
      window.alert(
        `Password reset successful!\n\n` +
        `Parent: ${parent.firstName} ${parent.lastName}\n` +
        `Email: ${parent.email}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Please send this to the parent's email.`
      );
      setAlert({ type: 'success', message: 'Parent password reset successfully!' });
    } catch (error) {
      console.error('Error resetting password:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to reset password' 
      });
    }
  };

  // Filter parents based on search
  const filteredParents = parents.filter((parent) => {
    const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
    const email = parent.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="p-6">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Parent Management</h1>
            <p className="text-gray-600 mt-1">Manage parent and guardian accounts</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }} icon={FiPlus}>
            Add Parent
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Parents Grid */}
        {filteredParents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No parents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a parent account.
            </p>
            <div className="mt-6">
              <Button onClick={() => { resetForm(); setShowModal(true); }} icon={FiPlus}>
                Add First Parent
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParents.map((parent) => (
              <div
                key={parent._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiUser className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        <a href={`/profile/${parent._id}`} className="hover:text-primary-700">
                          {parent.firstName} {parent.lastName}
                        </a>
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500">Parent</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {parent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                    <div className="flex space-x-2 items-center">
                    <button
                      onClick={() => handleResetPassword(parent)}
                      className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                      title="Reset Password"
                    >
                      <FiKey size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(parent)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    {parent.isActive ? (
                      <button
                        onClick={() => handleDeactivate(parent._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                        title="Deactivate"
                      >
                        <FiUserMinus size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(parent._id)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                        title="Activate"
                      >
                        <FiUserCheck size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FiMail className="mr-2" />
                    <span>{parent.email}</span>
                  </div>
                  {parent.phone && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2" />
                      <span>{parent.phone}</span>
                    </div>
                  )}
                </div>

                {parent.address && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span>{' '}
                      {typeof parent.address === 'string' 
                        ? parent.address 
                        : `${parent.address.street || ''}, ${parent.address.city || ''}, ${parent.address.state || ''} ${parent.address.zipCode || ''}`.trim()
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingParent ? 'Edit Parent' : 'Add New Parent'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={editingParent}
              />
              {editingParent && (
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              )}
            </div>

            {!editingParent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter home address"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingParent ? 'Update Parent' : 'Create Parent'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ParentList;
