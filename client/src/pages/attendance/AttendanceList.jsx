import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { attendanceAPI, childrenAPI } from '../../api';
import { FiCalendar, FiCheck, FiX, FiClock, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AttendanceList = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterChild, setFilterChild] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchChildren();
    fetchAttendance();
  }, [selectedDate, filterChild]);

  const fetchChildren = async () => {
    try {
      const response = await childrenAPI.getAll();
      setChildren(response.data || []);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { date: selectedDate };
      if (filterChild) params.child = filterChild;
      
      const response = await attendanceAPI.getAll(params);
      setAttendanceRecords(response.data || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCheckIn = async (childId) => {
    try {
      const attendanceData = {
        child: childId,
        date: selectedDate,
        checkInTime: new Date().toISOString(),
        status: 'present',
        recordedBy: user._id // Will be validated on backend
      };

      console.log('Sending attendance data:', attendanceData);
      
      await attendanceAPI.create(attendanceData);
      showAlert('success', 'Check-in recorded successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Attendance error:', error);
      console.error('Error response:', error.response?.data);
      showAlert('error', error.response?.data?.message || error.response?.data?.error || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await attendanceAPI.update(attendanceId, {
        checkOutTime: new Date().toISOString()
      });
      showAlert('success', 'Check-out recorded successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error response:', error.response?.data);
      showAlert('error', error.response?.data?.message || error.response?.data?.error || 'Failed to record check-out');
    }
  };

  const handleMarkAbsent = async (childId) => {
    try {
      const attendanceData = {
        child: childId,
        date: selectedDate,
        status: 'absent',
        recordedBy: user._id
      };

      await attendanceAPI.create(attendanceData);
      showAlert('success', 'Marked as absent');
      fetchAttendance();
    } catch (error) {
      console.error('Absent error:', error);
      console.error('Error response:', error.response?.data);
      showAlert('error', error.response?.data?.message || error.response?.data?.error || 'Failed to mark absence');
    }
  };

  const getAttendanceForChild = (childId) => {
    return attendanceRecords.find(record => 
      record.child?._id === childId || record.child === childId
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canMarkAttendance = user?.role === 'admin' || user?.role === 'staff';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
            <p className="text-gray-600 mt-1">
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? 'Today\'s attendance' 
                : `Attendance for ${selectedDate}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <select
              value={filterChild}
              onChange={(e) => setFilterChild(e.target.value)}
              className="input-field"
            >
              <option value="">All Children</option>
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Attendance Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {children.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No children found</h3>
                  <p className="mt-1 text-sm text-gray-500">Add children to start tracking attendance.</p>
                </div>
              </Card>
            ) : (
              children.map((child) => {
                const attendance = getAttendanceForChild(child._id);
                const isPresent = attendance?.status === 'present';
                const isAbsent = attendance?.status === 'absent';

                return (
                  <Card key={child._id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isPresent ? 'bg-green-100' : isAbsent ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {isPresent ? (
                            <FiCheck className="text-green-600 h-6 w-6" />
                          ) : isAbsent ? (
                            <FiX className="text-red-600 h-6 w-6" />
                          ) : (
                            <FiClock className="text-gray-400 h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {child.firstName} {child.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Age: {child.age || 'N/A'} • Gender: {child.gender}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {attendance ? (
                          <>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700">
                                Check-in: {formatTime(attendance.checkInTime)}
                              </p>
                              {attendance.checkOutTime && (
                                <p className="text-sm text-gray-500">
                                  Check-out: {formatTime(attendance.checkOutTime)}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Status: <span className={`font-medium ${
                                  isPresent ? 'text-green-600' : 'text-red-600'
                                }`}>{attendance.status}</span>
                              </p>
                            </div>
                            {canMarkAttendance && isPresent && !attendance.checkOutTime && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCheckOut(attendance._id)}
                              >
                                Check Out
                              </Button>
                            )}
                          </>
                        ) : (
                          canMarkAttendance && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                icon={FiCheck}
                                onClick={() => handleCheckIn(child._id)}
                              >
                                Check In
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={FiX}
                                onClick={() => handleMarkAbsent(child._id)}
                              >
                                Absent
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {attendance?.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {attendance.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && children.length > 0 && (
          <Card>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Present</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {attendanceRecords.filter(r => r.status === 'absent').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">
                  {children.length - attendanceRecords.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Not Marked</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceList;
