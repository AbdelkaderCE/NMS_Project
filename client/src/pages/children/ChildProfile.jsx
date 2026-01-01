import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiCalendar, FiPhone, FiMail, FiMapPin, FiHeart, 
  FiAlertCircle, FiEdit2, FiArrowLeft, FiActivity, FiDollarSign,
  FiCheckCircle, FiClock, FiFileText, FiX, FiCheck
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { childrenAPI, attendanceAPI, activityAPI, paymentAPI, absenceExcuseAPI } from '../../api';
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
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [excuseForm, setExcuseForm] = useState({
    reason: '',
    description: ''
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

      // Fetch recent attendance (last 7 days)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentAttendanceRes = await attendanceAPI.getAll({
        child: id,
        startDate: last7Days.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        limit: 7
      });
      setRecentAttendance(recentAttendanceRes.data || []);
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenExcuseModal = (attendance) => {
    setSelectedAttendance(attendance);
    setShowExcuseModal(true);
  };

  const handleSubmitExcuse = async (e) => {
    e.preventDefault();
    try {
      await absenceExcuseAPI.submit({
        child: child._id,
        absenceDate: new Date(selectedAttendance.date).toISOString(),
        reason: excuseForm.reason,
        description: excuseForm.description
      });
      showAlert('success', 'Excuse submitted successfully! The teacher will review it.');
      setShowExcuseModal(false);
      setExcuseForm({ reason: '', description: '' });
      setSelectedAttendance(null);
    } catch (error) {
      console.error('Failed to submit excuse:', error);
      showAlert('error', error.response?.data?.message || 'Failed to submit excuse');
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
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg">
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
                <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/70 to-white/50 border border-blue-200/30 rounded-lg p-4 hover:border-blue-300/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
                    </div>
                    <FiCheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-purple-50/70 to-white/50 border border-purple-200/30 rounded-lg p-4 hover:border-purple-300/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Activities</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activitiesCount}</p>
                    </div>
                    <FiActivity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-yellow-50/70 to-white/50 border border-yellow-200/30 rounded-lg p-4 hover:border-yellow-300/50 transition-all shadow-sm">
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

        {/* Recent Attendance - Visible to all users */}
        <Card title="Recent Attendance (Last 7 Days)">
          {alert && (
            <div className="mb-4">
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}
          
          {recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((attendance) => {
                const isAbsent = attendance.status === 'absent';
                const isPresent = attendance.status === 'present' || attendance.status === 'late';
                const date = new Date(attendance.date);
                
                return (
                  <div 
                    key={attendance._id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isPresent 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPresent ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {isPresent ? (
                            <FiCheck className="text-green-600 h-5 w-5" />
                          ) : (
                            <FiX className="text-red-600 h-5 w-5" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900">
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                          <p className={`text-sm font-medium ${
                            isPresent ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Status: {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                          </p>
                          {attendance.checkInTime && (
                            <p className="text-sm text-gray-600">
                              Check-in: {new Date(attendance.checkInTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {attendance.checkOutTime && ` • Check-out: ${new Date(attendance.checkOutTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Show "Submit Excuse" button for parents when child is absent */}
                      {isAbsent && user?.role === 'parent' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={FiFileText}
                          onClick={() => handleOpenExcuseModal(attendance)}
                        >
                          Submit Excuse
                        </Button>
                      )}
                    </div>

                    {attendance.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {attendance.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>No attendance records in the last 7 days</p>
            </div>
          )}
        </Card>

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

        {/* Absence Excuse Modal */}
        <Modal
          isOpen={showExcuseModal}
          onClose={() => {
            setShowExcuseModal(false);
            setSelectedAttendance(null);
            setExcuseForm({ reason: '', description: '' });
          }}
          title="Submit Absence Excuse"
        >
          <form onSubmit={handleSubmitExcuse} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Submitting excuse for <span className="font-semibold">{child?.firstName} {child?.lastName}</span> on {selectedAttendance && new Date(selectedAttendance.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <select
                value={excuseForm.reason}
                onChange={(e) => setExcuseForm({ ...excuseForm, reason: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a reason</option>
                <option value="illness">Illness</option>
                <option value="medical_appointment">Medical Appointment</option>
                <option value="family_emergency">Family Emergency</option>
                <option value="travel">Travel</option>
                <option value="religious_observance">Religious Observance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={excuseForm.description}
                onChange={(e) => setExcuseForm({ ...excuseForm, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Please provide details about the absence..."
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The teacher will be notified and will review your excuse.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowExcuseModal(false);
                  setSelectedAttendance(null);
                  setExcuseForm({ reason: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Excuse</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ChildProfile;
