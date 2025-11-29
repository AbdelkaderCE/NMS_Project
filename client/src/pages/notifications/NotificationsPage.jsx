import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../api/notificationAPI';
import { useSocket } from '../../context/SocketContext';
import Layout from '../../components/layout/Layout';

const NotificationsPage = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const { newNotification } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  useEffect(() => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  }, [newNotification]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter === 'unread') params.read = false;
      if (filter === 'read') params.read = true;

      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications || []);
      setPagination(response.data.pagination || null);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationAPI.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(notificationId);
      const deletedNotification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!deletedNotification?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationAPI.clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: '💬',
      payment: '💰',
      enrollment: '📝',
      attendance: '✅',
      child_registration: '👶',
      staff_added: '👔',
      activity_scheduled: '🎯',
      document_uploaded: '📄',
      system: '⚙️',
    };
    return icons[type] || '🔔';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      normal: 'text-blue-600 bg-blue-50 border-blue-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return colors[priority] || colors.normal;
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 backdrop-blur-sm bg-white/40 border border-blue-200/30 rounded-xl p-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
              <FiBell className="h-7 w-7 text-blue-600" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600/70 mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <FiCheckCircle className="h-4 w-4" />
                Mark all as read
              </button>
            )}
            {notifications.some((n) => n.read) && (
              <button
                onClick={handleClearRead}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <FiTrash2 className="h-4 w-4" />
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FiFilter className="h-5 w-5 text-blue-600" />
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition-all font-medium ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'backdrop-blur-sm bg-white/70 border border-blue-200/30 text-gray-700 hover:bg-white/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition-all font-medium ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'backdrop-blur-sm bg-white/70 border border-blue-200/30 text-gray-700 hover:bg-white/80'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => {
              setFilter('read');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition-all font-medium ${
              filter === 'read'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'backdrop-blur-sm bg-white/70 border border-blue-200/30 text-gray-700 hover:bg-white/80'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-xl">
            <FiBell className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No notifications found</p>
            <p className="text-sm text-gray-600 mt-1">
              {filter === 'all'
                ? "You're all caught up!"
                : `No ${filter} notifications`}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 backdrop-blur-sm rounded-xl hover:shadow-md cursor-pointer transition-all group border-2 ${
                !notification.read 
                  ? getPriorityColor(notification.priority) + ' bg-opacity-10'
                  : 'border-blue-200/30 bg-white/70 hover:border-blue-300/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icon */}
                  <span className="text-3xl mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="h-2.5 w-2.5 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{notification.timeAgo}</span>
                      <span>•</span>
                      <span className="capitalize">{notification.type.replace(/_/g, ' ')}</span>
                      {notification.priority === 'urgent' && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 font-semibold">URGENT</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      className="p-2 hover:bg-green-100/50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck className="h-5 w-5 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(notification._id, e)}
                    className="p-2 hover:bg-red-100/50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default NotificationsPage;
