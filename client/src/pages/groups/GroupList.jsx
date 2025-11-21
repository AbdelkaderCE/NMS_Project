import { useState, useEffect } from 'react';
import { groupAPI, classAPI, staffAPI, childrenAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiClock, FiUser } from 'react-icons/fi';

const GroupList = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [alert, setAlert] = useState(null);
  const [classFilter, setClassFilter] = useState('all');

  const [formData, setFormData] = useState({
    class: '',
    name: '',
    maxCapacity: '',
    room: '',
    instructors: [],
    schedule: {
      days: [],
      startTime: '09:00',
      endTime: '17:00',
    },
    isActive: true,
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, classesRes, staffRes, childrenRes] = await Promise.all([
        groupAPI.getAll(),
        classAPI.getAll(),
        staffAPI.getAll(),
        childrenAPI.getAll(),
      ]);
      setGroups(groupsRes.data || []);
      setClasses(classesRes.data || []);
      setStaff(staffRes.data || []);
      setChildren(childrenRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load groups' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupData = {
        ...formData,
        maxCapacity: parseInt(formData.maxCapacity),
      };

      if (isEditing && selectedGroup) {
        await groupAPI.update(selectedGroup._id, groupData);
        setAlert({ type: 'success', message: 'Group updated successfully!' });
      } else {
        await groupAPI.create(groupData);
        setAlert({ type: 'success', message: 'Group created successfully!' });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving group:', error);
      const errorData = error.response?.data || error;
      const errorMessage = errorData.errors?.map(e => e.message || e.msg).join(', ') || errorData.message || 'Failed to save group';
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      class: group.class?._id || '',
      name: group.name,
      maxCapacity: group.maxCapacity || '',
      room: group.room || '',
      instructors: group.instructors?.map(i => i._id) || [],
      schedule: {
        days: group.schedule?.days || [],
        startTime: group.schedule?.startTime || '09:00',
        endTime: group.schedule?.endTime || '17:00',
      },
      isActive: group.isActive !== false,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      await groupAPI.delete(id);
      setAlert({ type: 'success', message: 'Group deleted successfully!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete group';
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const resetForm = () => {
    setFormData({
      class: '',
      name: '',
      maxCapacity: '',
      room: '',
      instructors: [],
      schedule: {
        days: [],
        startTime: '09:00',
        endTime: '17:00',
      },
      isActive: true,
    });
    setSelectedGroup(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const handleDayToggle = (day) => {
    const days = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter(d => d !== day)
      : [...formData.schedule.days, day];
    setFormData({ ...formData, schedule: { ...formData.schedule, days } });
  };

  const handleInstructorToggle = (staffId) => {
    const instructors = formData.instructors.includes(staffId)
      ? formData.instructors.filter(id => id !== staffId)
      : [...formData.instructors, staffId];
    setFormData({ ...formData, instructors });
  };

  const filteredGroups = classFilter === 'all'
    ? groups
    : groups.filter(g => g.class?._id === classFilter);

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
            <p className="text-gray-600 mt-1">Manage learning groups within classes</p>
          </div>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" />
            Add Group
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Classes</option>
          {classes.map((classItem) => (
            <option key={classItem._id} value={classItem._id}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group._id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.class?.name}</p>
                {group.room && (
                  <p className="text-xs text-gray-400 mt-1">Room: {group.room}</p>
                )}
              </div>
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <FiUsers size={18} />
                  <span className="text-sm">Capacity</span>
                </span>
                <span className="text-sm font-medium">
                  {group.childrenCount || 0} / {group.maxCapacity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <FiUser size={18} />
                  <span className="text-sm">Instructors</span>
                </span>
                <span className="text-sm font-medium">
                  {group.instructors?.length || 0}
                </span>
              </div>
            </div>

            {group.schedule?.days && group.schedule.days.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Schedule</p>
                <div className="flex flex-wrap gap-1">
                  {group.schedule.days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize"
                    >
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
                {group.schedule.startTime && group.schedule.endTime && (
                  <p className="text-xs text-gray-500 mt-2">
                    {group.schedule.startTime} - {group.schedule.endTime}
                  </p>
                )}
              </div>
            )}

            {!group.isActive && (
              <div className="mt-3">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  Inactive
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create/Edit Group Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={isEditing ? 'Edit Group' : 'Add New Group'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Group Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Group A, Morning Group"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Capacity *"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                required
              />
              <Input
                label="Room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructors *
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {staff.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.instructors.includes(s._id)}
                      onChange={() => handleInstructorToggle(s._id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {s.user?.firstName} {s.user?.lastName} - {s.position}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.schedule.days.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={formData.schedule.startTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startTime: e.target.value },
                  })
                }
              />
              <Input
                label="End Time"
                type="time"
                value={formData.schedule.endTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endTime: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Group' : 'Create Group'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default GroupList;
