import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiCalendar, FiPhone, FiMail, FiMapPin, FiBriefcase,
  FiEdit2, FiArrowLeft, FiAward, FiClock, FiDollarSign, FiUsers
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { staffAPI, classAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const StaffProfile = ({ onSearchClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedClasses, setAssignedClasses] = useState([]);

  // Only admin can access staff profiles
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchStaffData();
  }, [id, user]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getById(id);
      setStaff(response.data);

      // Fetch assigned classes
      const classesRes = await classAPI.getAll();
      const allClasses = classesRes.data || [];
      const staffClasses = allClasses.filter(c => 
        c.teachers?.some(t => t._id === id || t === id)
      );
      setAssignedClasses(staffClasses);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
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

  if (!staff) {
    return (
      <Layout onSearchClick={onSearchClick}>
        <div className="text-center py-12">
          <FiBriefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Staff member not found</h3>
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
          
          <Link to={`/staff/edit/${staff._id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FiEdit2 className="h-5 w-5" />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {staff.photo ? (
                <img
                  src={staff.photo}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
                  <span className="text-4xl font-bold text-white">
                    {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {staff.firstName} {staff.lastName}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <span className="flex items-center gap-1 capitalize">
                      <FiBriefcase className="h-4 w-4" />
                      {staff.position}
                    </span>
                    {staff.department && (
                      <span className="flex items-center gap-1">
                        <FiUsers className="h-4 w-4" />
                        {staff.department}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  staff.isActive 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Salary</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${(staff.salary?.amount || staff.salary || 0).toLocaleString()}
                      </p>
                    </div>
                    <FiDollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Classes</p>
                      <p className="text-2xl font-bold text-blue-600">{assignedClasses.length}</p>
                    </div>
                    <FiUsers className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Qualifications</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {staff.qualifications?.length || 0}
                      </p>
                    </div>
                    <FiAward className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  {staff.user?.email || staff.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiPhone className="h-4 w-4 text-gray-400" />
                  {staff.phone || 'N/A'}
                </p>
              </div>
              {staff.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <FiMapPin className="h-4 w-4 text-gray-400" />
                    {staff.address}
                  </p>
                </div>
              )}
              {staff.emergencyContact && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Emergency Contact
                  </label>
                  <p className="text-gray-900 font-medium">{staff.emergencyContact.name}</p>
                  <p className="text-sm text-gray-600">{staff.emergencyContact.relationship}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FiPhone className="h-4 w-4" />
                    {staff.emergencyContact.phone}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Employment Information */}
          <Card title="Employment Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <p className="text-gray-900 font-medium capitalize">{staff.position}</p>
              </div>
              {staff.department && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{staff.department}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Hire Date</label>
                <p className="text-gray-900">
                  {new Date(staff.hireDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Salary</label>
                <p className="text-gray-900 font-semibold text-lg">
                  ${(staff.salary?.amount || staff.salary || 0).toLocaleString()} / {staff.salary?.paymentFrequency || 'month'}
                </p>
              </div>
              {staff.contract?.type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Type</label>
                  <p className="text-gray-900 capitalize">{staff.contract.type}</p>
                </div>
              )}
              {staff.contract?.startDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Period</label>
                  <p className="text-gray-900">
                    {new Date(staff.contract.startDate).toLocaleDateString()} - {' '}
                    {staff.contract.endDate 
                      ? new Date(staff.contract.endDate).toLocaleDateString()
                      : 'Ongoing'
                    }
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Qualifications */}
          <Card title="Qualifications & Certifications">
            <div className="space-y-4">
              {staff.qualifications && staff.qualifications.length > 0 ? (
                staff.qualifications.map((qual, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{qual.degree}</p>
                        <p className="text-sm text-gray-600">{qual.institution}</p>
                        {qual.field && (
                          <p className="text-sm text-gray-500 mt-1">{qual.field}</p>
                        )}
                        {qual.graduationYear && (
                          <p className="text-xs text-gray-500 mt-1">
                            Graduated: {qual.graduationYear}
                          </p>
                        )}
                      </div>
                      <FiAward className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No qualifications recorded</p>
              )}

              {staff.certifications && staff.certifications.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Certifications</h4>
                  {staff.certifications.map((cert, index) => (
                    <div key={index} className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      {cert.issuingOrganization && (
                        <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                      )}
                      {cert.issueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expiryDate && (
                            <span className={`ml-2 ${new Date(cert.expiryDate) < new Date() ? 'text-red-600' : ''}`}>
                              • Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Classes */}
          <Card title="Assigned Classes">
            <div className="space-y-3">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((classItem) => (
                  <Link
                    key={classItem._id}
                    to={`/classes/${classItem._id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{classItem.name}</p>
                        <p className="text-sm text-gray-600">
                          {classItem.ageGroup} • Capacity: {classItem.children?.length || 0}/{classItem.capacity}
                        </p>
                      </div>
                      <FiUsers className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No classes assigned</p>
              )}
            </div>
          </Card>
        </div>

        {/* Work Schedule */}
        {staff.workSchedule && staff.workSchedule.length > 0 && (
          <Card title="Work Schedule">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                const schedule = staff.workSchedule.find(s => s.day === day);
                return (
                  <div
                    key={day}
                    className={`p-4 rounded-lg ${
                      schedule?.isWorkingDay
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <p className="font-medium text-gray-900 capitalize mb-2">{day}</p>
                    {schedule?.isWorkingDay ? (
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Off</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StaffProfile;
