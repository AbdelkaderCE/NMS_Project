import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import { activityAPI, childrenAPI, staffAPI, classAPI, groupAPI } from '../../api';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const ActivityList = ({ onSearchClick }) => {
  const [activities, setActivities] = useState([]);
  const [children, setChildren] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    targetType: 'child', // 'child', 'group', or 'class'
    child: '',
    group: '',
    class: '',
    title: '',
    description: '',
    type: 'meal',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    notes: '',
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, childrenRes, staffRes, classesRes, groupsRes] = await Promise.all([
        activityAPI.getAll(),
        childrenAPI.getAll(),
        staffAPI.getAll(),
        classAPI.getAll(),
        groupAPI.getAll(),
      ]);
      setActivities(activitiesRes.data);
      setChildren(childrenRes.data);
      setStaff(staffRes.data);
      setClasses(classesRes.data);
      setGroups(groupsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
      setLoading(false);
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
      console.error('Error fetching groups:', error);
      setAlert({ type: 'error', message: 'Failed to load groups' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform data to match backend Activity model
      const activityData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        // Combine date + time into Date object for startTime
        startTime: formData.startTime 
          ? new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
          : new Date(`${formData.date}T09:00:00`).toISOString(),
        // Combine date + time into Date object for endTime (optional)
        endTime: formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}:00`).toISOString()
          : undefined,
        notes: formData.notes || undefined,
        // Clear all targets first (important for updates)
        child: null,
        group: null,
        class: null,
      };

      // Add target based on targetType
      if (formData.targetType === 'child' && formData.child) {
        activityData.child = formData.child;
      } else if (formData.targetType === 'group' && formData.group) {
        activityData.group = formData.group;
      } else if (formData.targetType === 'class' && formData.class) {
        activityData.class = formData.class;
      }

      if (isEditing && selectedActivity) {
        await activityAPI.update(selectedActivity._id, activityData);
        setAlert({ type: 'success', message: 'Activity updated successfully!' });
      } else {
        await activityAPI.create(activityData);
        setAlert({ type: 'success', message: 'Activity created successfully!' });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving activity:', error);
      console.error('Error object keys:', Object.keys(error));
      console.error('Error.response:', error.response);
      console.error('Error itself:', error);
      
      let errorMessage = 'Failed to save activity';
      
      // The axios interceptor returns error.response.data or error directly
      const errorData = error.response?.data || error;
      console.error('Error data:', errorData);
      console.error('Errors array:', errorData.errors);
      
      if (errorData.errors) {
        console.error('Individual errors:');
        errorData.errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err);
        });
        errorMessage = errorData.errors.map(e => e.message || e.msg).join(', ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    // Extract time from Date object
    const getTimeString = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toTimeString().substring(0, 5); // HH:MM format
    };
    
    // Determine target type
    let targetType = 'child';
    if (activity.group) targetType = 'group';
    else if (activity.class) targetType = 'class';

    setFormData({
      targetType,
      child: activity.child?._id || activity.child || '',
      group: activity.group?._id || activity.group || '',
      class: activity.class?._id || activity.class || '',
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      date: activity.date.split('T')[0],
      startTime: getTimeString(activity.startTime),
      endTime: getTimeString(activity.endTime),
      notes: activity.notes || '',
    });

    // If editing a group activity, fetch groups for its class
    if (activity.group?._id) {
      const groupObj = groups.find(g => g._id === activity.group._id);
      if (groupObj?.class) {
        fetchGroupsByClass(groupObj.class);
      }
    }

    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    try {
      await activityAPI.delete(id);
      setAlert({ type: 'success', message: 'Activity deleted successfully!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      setAlert({ type: 'error', message: 'Failed to delete activity' });
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      targetType: 'child',
      child: '',
      group: '',
      class: '',
      title: '',
      description: '',
      type: 'meal',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      notes: '',
    });
    setSelectedActivity(null);
    setIsEditing(false);
    setShowModal(false);
    // Reload all groups when closing modal
    fetchData();
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesSearch =
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: activities.length,
    upcoming: activities.filter((a) => new Date(a.date) >= new Date()).length,
    past: activities.filter((a) => new Date(a.date) < new Date()).length,
    today: activities.filter((a) => {
      const today = new Date().toISOString().split('T')[0];
      return a.date.split('T')[0] === today;
    }).length,
  };

  if (loading) return (
    <Layout onSearchClick={onSearchClick}>
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    </Layout>
  );

  return (
    <Layout onSearchClick={onSearchClick}>
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
            <h1 className="text-2xl font-bold text-gray-900">Activity Management</h1>
            <p className="text-gray-600 mt-1">Track daily activities and progress</p>
          </div>
        <p className="text-gray-600 mt-1">Schedule and manage nursery activities</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiCalendar className="text-blue-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.today}</p>
            </div>
            <FiClock className="text-green-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-orange-600">{stats.upcoming}</p>
            </div>
            <FiCalendar className="text-orange-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Past</p>
              <p className="text-2xl font-bold text-gray-600">{stats.past}</p>
            </div>
            <FiCalendar className="text-gray-500 text-3xl" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full md:w-auto">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="meal">Meal</option>
              <option value="nap">Nap</option>
              <option value="activity">Activity</option>
              <option value="learning">Learning</option>
              <option value="play">Play</option>
              <option value="outdoor">Outdoor</option>
              <option value="incident">Incident</option>
              <option value="other">Other</option>
            </select>
          </div>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="whitespace-nowrap"
            >
              <FiPlus className="mr-2" />
              Add Activity
            </Button>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div
            key={activity._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(activity)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      activity.type === 'meal'
                        ? 'bg-orange-100 text-orange-800'
                        : activity.type === 'nap'
                        ? 'bg-purple-100 text-purple-800'
                        : activity.type === 'activity'
                        ? 'bg-blue-100 text-blue-800'
                        : activity.type === 'learning'
                        ? 'bg-cyan-100 text-cyan-800'
                        : activity.type === 'play'
                        ? 'bg-green-100 text-green-800'
                        : activity.type === 'outdoor'
                        ? 'bg-teal-100 text-teal-800'
                        : activity.type === 'incident'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {activity.type}
                  </span>
                </div>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(activity)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(activity._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {activity.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2" />
                  {new Date(activity.date).toLocaleDateString()}
                  {activity.startTime && ` at ${new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUsers className="mr-2" />
                  {activity.child && (
                    <span>
                      Child: <span className="font-medium">{activity.child?.firstName} {activity.child?.lastName}</span>
                    </span>
                  )}
                  {activity.group && (
                    <span>
                      Group: <span className="font-medium">{activity.group?.name}</span>
                    </span>
                  )}
                  {activity.class && !activity.group && (
                    <span>
                      Class: <span className="font-medium">{activity.class?.name}</span>
                    </span>
                  )}
                </div>
                {activity.loggedBy && (
                  <div className="flex items-center text-gray-600 text-xs">
                    Logged by: {activity.loggedBy.user?.firstName} {activity.loggedBy.user?.lastName}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiCalendar className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600 text-lg">No activities found</p>
          <p className="text-gray-500 mt-2">
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first activity to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={isEditing ? 'Edit Activity' : 'Create New Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Activity Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Science Workshop"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="meal">Meal</option>
              <option value="nap">Nap</option>
              <option value="activity">Activity</option>
              <option value="learning">Learning</option>
              <option value="play">Play</option>
              <option value="outdoor">Outdoor</option>
              <option value="incident">Incident</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Activity description (minimum 10 characters)..."
              required
              minLength="10"
              maxLength="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} / 1000 characters (minimum 10)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          {/* Target Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Target *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="child"
                  checked={formData.targetType === 'child'}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value, group: '', class: '' })}
                  className="mr-2"
                />
                Individual Child
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="group"
                  checked={formData.targetType === 'group'}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value, child: '' })}
                  className="mr-2"
                />
                Group
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="class"
                  checked={formData.targetType === 'class'}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value, child: '', group: '' })}
                  className="mr-2"
                />
                Entire Class
              </label>
            </div>
          </div>

          {/* Conditional Dropdowns Based on Target Type */}
          {formData.targetType === 'child' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Child *
              </label>
              <select
                value={formData.child}
                onChange={(e) => setFormData({ ...formData, child: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select child</option>
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.targetType === 'group' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => {
                    setFormData({ ...formData, class: e.target.value, group: '' });
                    fetchGroupsByClass(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select class first</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group *
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={!formData.class}
                  required
                >
                  <option value="">
                    {!formData.class ? 'Select a class first' : 'Select group'}
                  </option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.childrenCount || 0} children)
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {formData.targetType === 'class' && (
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
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Notes (Optional)"
            as="textarea"
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            maxLength="500"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Update Activity' : 'Create Activity'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedActivity(null);
          }}
          title={selectedActivity.title}
        >
          <div className="space-y-4">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedActivity.type === 'meal'
                    ? 'bg-orange-100 text-orange-800'
                    : selectedActivity.type === 'nap'
                    ? 'bg-purple-100 text-purple-800'
                    : selectedActivity.type === 'activity'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedActivity.type === 'learning'
                    ? 'bg-cyan-100 text-cyan-800'
                    : selectedActivity.type === 'play'
                    ? 'bg-green-100 text-green-800'
                    : selectedActivity.type === 'outdoor'
                    ? 'bg-teal-100 text-teal-800'
                    : selectedActivity.type === 'incident'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedActivity.type}
              </span>
            </div>

            {selectedActivity.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedActivity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Date</h4>
                <p className="text-gray-600">
                  {new Date(selectedActivity.date).toLocaleDateString()}
                </p>
              </div>
              {selectedActivity.startTime && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Time</h4>
                  <p className="text-gray-600">
                    {new Date(selectedActivity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {selectedActivity.endTime && ` - ${new Date(selectedActivity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Target</h4>
              <p className="text-gray-600">
                {selectedActivity.child && (
                  <span>
                    Child: <span className="font-medium">{selectedActivity.child?.firstName} {selectedActivity.child?.lastName}</span>
                  </span>
                )}
                {selectedActivity.group && (
                  <span>
                    Group: <span className="font-medium">{selectedActivity.group?.name}</span>
                    {selectedActivity.group?.class?.name && (
                      <span className="text-sm text-gray-500"> (Class: {selectedActivity.group?.class?.name})</span>
                    )}
                  </span>
                )}
                {selectedActivity.class && !selectedActivity.group && (
                  <span>
                    Class: <span className="font-medium">{selectedActivity.class?.name}</span>
                  </span>
                )}
              </p>
            </div>

            {selectedActivity.loggedBy && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Logged By</h4>
                <p className="text-gray-600">
                  {selectedActivity.loggedBy.user?.firstName}{' '}
                  {selectedActivity.loggedBy.user?.lastName}
                </p>
              </div>
            )}

            {selectedActivity.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600">{selectedActivity.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default ActivityList;
