import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { activityAPI, childrenAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const ActivityCalendar = ({ onSearchClick }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchChildren();
    }
    fetchActivities();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await childrenAPI.getByParent(user._id);
      setChildren(response.data || []);
      
      // Auto-select first child if available
      if (response.data && response.data.length > 0 && selectedChild === 'all') {
        setSelectedChild(response.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch children:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'parent') {
        if (selectedChild && selectedChild !== 'all') {
          response = await activityAPI.getByChild(selectedChild);
        } else {
          // Fetch activities for all children
          const allActivities = [];
          for (const child of children) {
            const childActivities = await activityAPI.getByChild(child._id);
            allActivities.push(...(childActivities.data || []));
          }
          response = { data: allActivities };
        }
      } else {
        response = await activityAPI.getAll();
      }

      // Transform activities to calendar events
      const events = (response.data || []).map((activity) => ({
        id: activity._id,
        title: activity.title,
        start: new Date(activity.date),
        end: new Date(activity.date),
        resource: activity,
      }));

      setActivities(events);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setShowDetails(true);
  };

  const getEventStyle = (event) => {
    const activity = event.resource;
    let backgroundColor = '#3b82f6'; // blue
    
    if (activity.type === 'learning') backgroundColor = '#8b5cf6'; // purple
    else if (activity.type === 'play') backgroundColor = '#10b981'; // green
    else if (activity.type === 'meal') backgroundColor = '#f59e0b'; // orange
    else if (activity.type === 'nap') backgroundColor = '#6366f1'; // indigo
    else if (activity.type === 'outdoor') backgroundColor = '#14b8a6'; // teal
    else if (activity.type === 'medical') backgroundColor = '#ef4444'; // red
    else if (activity.type === 'incident') backgroundColor = '#dc2626'; // dark red
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Calendar</h1>
                <p className="text-gray-600 mt-1">View and track all activities by date</p>
              </div>
              
              {user?.role === 'parent' && children.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Filter by Child:</label>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {children.length > 1 && <option value="all">All Children</option>}
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.firstName} {child.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Activity Type Legend */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Types:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500"></span>
                  <span className="text-sm text-gray-700">Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-700">Play</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                  <span className="text-sm text-gray-700">Meal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500"></span>
                  <span className="text-sm text-gray-700">Nap</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-500"></span>
                  <span className="text-sm text-gray-700">Outdoor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                  <span className="text-sm text-gray-700">Medical</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : (
              <div style={{ height: '600px' }} className="bg-white rounded-lg">
                <Calendar
                  localizer={localizer}
                  events={activities}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={getEventStyle}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="month"
                  popup
                />
              </div>
            )}
          </div>
        </Card>

        {/* Activity Details Modal */}
        {showDetails && selectedEvent && (
          <Modal
            isOpen={showDetails}
            onClose={() => {
              setShowDetails(false);
              setSelectedEvent(null);
            }}
            title="Activity Details"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900 font-medium">{selectedEvent.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {selectedEvent.type}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-900">
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEvent.notes}</p>
                </div>
              )}

              {selectedEvent.child && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                  <p className="text-gray-900">
                    {selectedEvent.child.firstName} {selectedEvent.child.lastName}
                  </p>
                </div>
              )}

              {selectedEvent.group && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <p className="text-gray-900">{selectedEvent.group.name}</p>
                </div>
              )}

              {selectedEvent.class && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <p className="text-gray-900">{selectedEvent.class.name}</p>
                </div>
              )}

              {selectedEvent.loggedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logged By</label>
                  <p className="text-gray-900">
                    {selectedEvent.loggedBy.user?.firstName} {selectedEvent.loggedBy.user?.lastName}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedEvent(null);
                }}
              >
                Close
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default ActivityCalendar;
