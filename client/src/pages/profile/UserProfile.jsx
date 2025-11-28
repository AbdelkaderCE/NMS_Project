import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiArrowLeft, 
  FiSave, FiX, FiUsers, FiDollarSign, FiMessageSquare, FiCalendar
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { authAPI, childrenAPI, paymentAPI, messageAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UserProfile = ({ onSearchClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({
    childrenCount: 0,
    totalPaid: 0,
    pendingPayments: 0,
    messagesCount: 0
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Determine if current user can edit this profile
  const canEdit = () => {
    if (currentUser?.role === 'admin') return true; // Admin can edit anyone
    if (currentUser?._id === id) return true; // User can edit their own
    return false;
  };

  // Determine if current user can view this profile
  const canView = () => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'staff') return true;
    if (currentUser?._id === id) return true;
    return false;
  };

  useEffect(() => {
    if (!canView()) {
      navigate('/dashboard');
      return;
    }
    fetchProfileData();
  }, [id, currentUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile - always use getMe for current user
      const response = await authAPI.getMe();
      const profileData = response.data;
      
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: typeof profileData.address === 'string' 
          ? profileData.address 
          : profileData.address?.street 
            ? `${profileData.address.street}, ${profileData.address.city}, ${profileData.address.state} ${profileData.address.zipCode}, ${profileData.address.country}` 
            : ''
      });

      // Fetch stats if parent
      if (profileData.role === 'parent') {
        await fetchParentStats(profileData._id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showAlert('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentStats = async (userId) => {
    try {
      const [childrenRes, paymentsRes, messagesRes] = await Promise.all([
        childrenAPI.getByParent(userId),
        paymentAPI.getByParent(userId),
        messageAPI.getStats()
      ]);

      const children = childrenRes.data || [];
      const payments = paymentsRes.data || [];
      const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      setStats({
        childrenCount: children.length,
        totalPaid,
        pendingPayments,
        messagesCount: messagesRes.data?.total || 0
      });
    } catch (error) {
      console.error('Error fetching parent stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await authAPI.updateProfile(formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      showAlert('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const showAlert = (severity, message) => {
    setAlert({ severity, message });
    setTimeout(() => setAlert(null), 5000);
  };

  if (loading) {
    return (
      <Layout onSearchClick={onSearchClick}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout onSearchClick={onSearchClick}>
        <div className="text-center py-12">
          <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Profile not found</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {alert && (
          <Alert
            severity={alert.severity}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          {canEdit() && (
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiEdit2 className="h-5 w-5" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        address: profile.address || ''
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <FiX className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FiSave className="h-5 w-5" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${
                  profile.role === 'admin' 
                    ? 'from-purple-400 to-purple-600'
                    : profile.role === 'staff'
                    ? 'from-blue-400 to-blue-600'
                    : 'from-green-400 to-green-600'
                } flex items-center justify-center border-4 ${
                  profile.role === 'admin' 
                    ? 'border-purple-100'
                    : profile.role === 'staff'
                    ? 'border-blue-100'
                    : 'border-green-100'
                }`}>
                  <span className="text-4xl font-bold text-white">
                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      profile.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : profile.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      profile.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats for Parents */}
              {profile.role === 'parent' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Children</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.childrenCount}</p>
                      </div>
                      <FiUsers className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-xl font-bold text-green-600">
                          ${stats.totalPaid.toLocaleString()}
                        </p>
                      </div>
                      <FiDollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                      </div>
                      <FiCalendar className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.messagesCount}</p>
                      </div>
                      <FiMessageSquare className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FiMail className="h-4 w-4 text-gray-400" />
                      {profile.email}
                    </p>
                  </div>
                  {profile.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <FiPhone className="h-4 w-4 text-gray-400" />
                        {profile.phone}
                      </p>
                    </div>
                  )}
                  {profile.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <FiMapPin className="h-4 w-4 text-gray-400" />
                        {typeof profile.address === 'string' 
                          ? profile.address 
                          : `${profile.address.street || ''}, ${profile.address.city || ''}, ${profile.address.state || ''} ${profile.address.zipCode || ''}, ${profile.address.country || ''}`.replace(/,\s*,/g, ',').trim().replace(/^,\s*/, '').replace(/,\s*$/, '')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Account Information */}
          <Card title="Account Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 font-medium capitalize">{profile.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <p className={`font-medium ${profile.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {profile.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-gray-900">
                    {new Date(profile.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
