import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiCalendar, FiPhone, FiMail, FiMapPin, FiHeart, 
  FiAlertCircle, FiEdit2, FiArrowLeft, FiActivity, FiDollarSign,
  FiCheckCircle, FiClock, FiFileText
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { childrenAPI, attendanceAPI, activityAPI, paymentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ChildProfile = ({ onSearchClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    activitiesCount: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    fetchChildData();
  }, [id]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const response = await childrenAPI.getById(id);
      setChild(response.data);

      // Fetch stats
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Attendance rate this month - only count days with attendance records
      const attendanceRes = await attendanceAPI.getAll({
        child: id,
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      });
      const attendanceData = attendanceRes.data || [];
      const presentDays = attendanceData.filter(a => 
        a.status === 'present' || a.status === 'late'
      ).length;
      // Calculate percentage based on actual school days (attendance records exist)
      const totalSchoolDays = attendanceData.length;
      const attendanceRate = totalSchoolDays > 0 
        ? Math.round((presentDays / totalSchoolDays) * 100)
        : 100; // Show 100% if no records yet (avoid showing 0%)

      // Activities count this month
      const activitiesRes = await activityAPI.getByChild(id, {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      });
      const activitiesCount = activitiesRes.data?.length || 0;

      // Pending payments
      const paymentsRes = await paymentAPI.getByChild(id);
      const pendingPayments = paymentsRes.data?.filter(p => p.status === 'pending').length || 0;

      setStats({ attendanceRate, activitiesCount, pendingPayments });
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  if (!child) {
    return (
      <Layout onSearchClick={onSearchClick}>
        <div className="text-center py-12">
          <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Child not found</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          {(user?.role === 'admin' || 
            (user?.role === 'staff' && 
             ['manager', 'receptionist'].includes(user?.staffInfo?.position))) && (
            <Link to={`/children/edit/${child._id}`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <FiEdit2 className="h-5 w-5" />
                Edit Profile
              </button>
            </Link>
          )}
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {child.photo ? (
                <img
                  src={child.photo}
                  alt={`${child.firstName} ${child.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-primary-100">
                  <span className="text-4xl font-bold text-white">
                    {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {child.firstName} {child.lastName}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-4 w-4" />
                      {calculateAge(child.dateOfBirth)} years old
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUser className="h-4 w-4" />
                      {child.gender}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  child.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : child.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {child.status}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
                    </div>
                    <FiCheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Activities</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activitiesCount}</p>
                    </div>
                    <FiActivity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Payments</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                    </div>
                    <FiDollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{child.firstName} {child.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">
                  {new Date(child.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 capitalize">{child.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                <p className="text-gray-900">
                  {new Date(child.enrollmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {child.classGroup && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Class/Group</label>
                  <p className="text-gray-900">{child.classGroup.name}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Medical Information */}
          <Card title="Medical Information">
            <div className="space-y-4">
              {child.medicalRecord?.bloodType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Type</label>
                  <p className="text-gray-900">{child.medicalRecord.bloodType}</p>
                </div>
              )}
              
              {child.medicalRecord?.allergies && child.medicalRecord.allergies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Allergies</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {child.medicalRecord.allergies.map((allergy, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {child.medicalRecord?.medications && child.medicalRecord.medications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medications</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {child.medicalRecord.medications.map((med, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {child.medicalRecord?.conditions && child.medicalRecord.conditions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {child.medicalRecord.conditions.map((condition, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {child.dietaryRestrictions && child.dietaryRestrictions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dietary Restrictions</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {child.dietaryRestrictions.map((restriction, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Parents/Guardians */}
          <Card title="Parents/Guardians">
            <div className="space-y-4">
              {child.parents && child.parents.length > 0 ? (
                child.parents.map((parent, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {parent.parent?.firstName} {parent.parent?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{parent.relationship}</p>
                        {parent.parent?.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FiMail className="h-4 w-4" />
                            {parent.parent.email}
                          </p>
                        )}
                        {parent.parent?.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FiPhone className="h-4 w-4" />
                            {parent.parent.phone}
                          </p>
                        )}
                      </div>
                      {parent.isPrimary && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-semibold">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No parent information available</p>
              )}
            </div>
          </Card>

          {/* Emergency Contacts */}
          <Card title="Emergency Contacts">
            <div className="space-y-4">
              {child.emergencyContacts && child.emergencyContacts.length > 0 ? (
                child.emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{contact.relationship}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <FiPhone className="h-4 w-4" />
                      {contact.phone}
                    </p>
                    {contact.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FiMail className="h-4 w-4" />
                        {contact.email}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No emergency contacts available</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Only teachers and assistants can view attendance */}
          {(user?.role === 'admin' || 
            (user?.role === 'staff' && 
             (user?.staffInfo?.position === 'teacher' || user?.staffInfo?.position === 'assistant'))) && (
            <Link to={`/attendance?child=${child._id}`}>
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">View</p>
                    <p className="text-lg font-semibold text-gray-900">Attendance History</p>
                  </div>
                  <FiClock className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </Link>
          )}

          {/* Only teachers, assistants, and managers can view activities */}
          {(user?.role === 'admin' || user?.role === 'parent' ||
            (user?.role === 'staff' && 
             (user?.staffInfo?.position === 'teacher' || 
              user?.staffInfo?.position === 'assistant' || 
              user?.staffInfo?.position === 'manager'))) && (
            <Link to={`/activities?child=${child._id}`}>
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">View</p>
                    <p className="text-lg font-semibold text-gray-900">Activities</p>
                  </div>
                  <FiActivity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </Link>
          )}

          {/* Only admin, parent, and receptionist can view payments */}
          {(user?.role === 'admin' || user?.role === 'parent' ||
            (user?.role === 'staff' && user?.staffInfo?.position === 'receptionist')) && (
            <Link to={`/payments?child=${child._id}`}>
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">View</p>
                    <p className="text-lg font-semibold text-gray-900">Payments</p>
                  </div>
                  <FiDollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChildProfile;
