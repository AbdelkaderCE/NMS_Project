import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiArrowLeft, 
  FiSave, FiX, FiUsers, FiDollarSign, FiMessageSquare, FiCalendar
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { authAPI, userAPI, childrenAPI, paymentAPI, messageAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';

const UserProfile = ({ onSearchClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordSetting, setIsPasswordSetting] = useState(false);
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
    if (currentUser?.role === 'staff' && currentUser?.staffInfo?.position === 'manager') return true; // Manager can edit anyone
    if (currentUser?._id === id) return true; // User can edit their own
    return false;
  };

  // Determine if current user can view this profile
  const canView = () => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'staff') return true; // Staff can view profiles
    if (currentUser?._id === id) return true; // Self
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
      let profileData;
      if (!id || currentUser?._id === id) {
        const response = await authAPI.getMe();
        profileData = response.data;
      } else {
        // Admin/staff viewing another user's profile
        const response = await userAPI.getById(id);
        profileData = response.data;
      }
      
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || profileData.name?.split(' ')[0] || '',
        lastName: profileData.lastName || (profileData.name?.split(' ').slice(1).join(' ') || ''),
        email: profileData.email || '',
        phone: profileData.phone || profileData.staffInfo?.phone || '',
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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg"
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
                    className="flex items-center gap-2 px-4 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/30 text-gray-700 rounded-lg hover:bg-white/80 transition-all font-medium"
                  >
                    <FiX className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-medium shadow-md hover:shadow-lg"
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
          <div className="bg-gradient-to-r from-blue-50/50 to-white/50 rounded-xl p-6 -mx-6 -mt-6 mb-6 border-b border-blue-200/30">
            <div className="flex items-start gap-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={`${profile.firstName || profile.name || ''} ${profile.lastName || ''}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
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
                      ? 'border-purple-200'
                      : profile.role === 'staff'
                      ? 'border-blue-200'
                      : 'border-green-200'
                  } shadow-lg`}>
                    <span className="text-4xl font-bold text-white">
                        {(profile.firstName || profile.name || 'N').charAt(0)}{(profile.lastName || (profile.name?.split(' ')[1] || '')).charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                      {profile.firstName || profile.name || 'N/A'} {profile.lastName || ''}
                    </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      profile.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : profile.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.role}{profile.staffInfo?.position ? ` • ${profile.staffInfo.position}` : ''}
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
                  <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/70 to-white/50 border border-blue-200/30 rounded-lg p-4 hover:border-blue-300/50 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Children</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.childrenCount}</p>
                      </div>
                      <FiUsers className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-gradient-to-br from-green-50/70 to-white/50 border border-green-200/30 rounded-lg p-4 hover:border-green-300/50 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(stats.totalPaid)}
                        </p>
                      </div>
                      <FiDollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-gradient-to-br from-amber-50/70 to-white/50 border border-amber-200/30 rounded-lg p-4 hover:border-amber-300/50 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pendingPayments}</p>
                      </div>
                      <FiCalendar className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/70 to-white/50 border border-indigo-200/30 rounded-lg p-4 hover:border-indigo-300/50 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.messagesCount}</p>
                      </div>
                      <FiMessageSquare className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                        className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
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
                        className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
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
                      className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
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
                      className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
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
                      className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">
                      {(profile.firstName || 'N/A')} {(profile.lastName || '')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FiMail className="h-4 w-4 text-gray-400" />
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FiPhone className="h-4 w-4 text-gray-400" />
                      {profile.phone || profile.staffInfo?.phone || 'N/A'}
                    </p>
                  </div>
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

          {/* Admin/Manager: Set password for this user */}
          {canEdit() && id && currentUser?._id !== id && (
            <Card title="Set User Password">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Set a new password for this user. Minimum 6 characters.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-3 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all"
                  />
                  <button
                    disabled={isPasswordSetting}
                    onClick={async () => {
                      try {
                        setIsPasswordSetting(true);
                        await userAPI.setPassword(id, newPassword);
                        setNewPassword('');
                        showAlert('success', 'Password updated successfully');
                      } catch (error) {
                        showAlert('error', error.response?.data?.message || 'Failed to update password');
                      } finally {
                        setIsPasswordSetting(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set Password
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
