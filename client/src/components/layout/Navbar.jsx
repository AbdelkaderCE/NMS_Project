import { useState, useEffect, useRef } from 'react';
import { FiBell, FiMenu, FiX, FiSearch, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../api/notificationAPI';

const Navbar = ({ onMenuClick, isSidebarOpen, onSearchClick }) => {
  const { user } = useAuth();
  const { newNotification } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
import { useState, useEffect } from 'react';
import { FiBell, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const MAX_NOTIFICATIONS = 10;

const Navbar = ({ onMenuClick, isSidebarOpen, onSearchClick }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Listen for real-time activity notifications
  useEffect(() => {
    if (!socket) return;

    const handleActivityNotification = (data) => {
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'activity',
        title: data.title || 'New Activity',
        message: data.message,
        link: data.link || '/activities/calendar',
        timestamp: data.timestamp || new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));
    };

    socket.on('activity-notification', handleActivityNotification);

    return () => {
      socket.off('activity-notification', handleActivityNotification);
    };
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to the link
    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Detect if Mac for keyboard shortcut display
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const searchShortcut = isMac ? '⌘K' : 'Ctrl+K';

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Listen for new notifications from socket
  useEffect(() => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
        });
      }
    }
  }, [newNotification]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications...');
      const response = await notificationAPI.getNotifications({ limit: 20 });
      console.log('🔔 Notifications response:', response);
      // Response structure: { success, message, data: { notifications, unreadCount, pagination } }
      const { notifications = [], unreadCount = 0 } = response.data || response;
      setNotifications(notifications);
      setUnreadCount(unreadCount);
      console.log('🔔 Set notifications:', notifications?.length, 'Unread:', unreadCount);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error response:', error.response);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('🔔 Fetching unread count...');
      const response = await notificationAPI.getUnreadCount();
      console.log('🔔 Unread count response:', response);
      // Response structure: { success, message, unreadCount } - no nested data
      const unreadCount = response?.unreadCount || response?.data?.unreadCount || 0;
      setUnreadCount(unreadCount);
      console.log('🔔 Set unread count to:', unreadCount);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      console.error('❌ Error response:', error.response);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await notificationAPI.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate to link if available
      if (notification.link) {
        navigate(notification.link);
        setShowNotifications(false);
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
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      const deletedNotification = notifications.find((n) => n._id === notificationId);
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
      urgent: 'text-red-600',
      high: 'text-orange-600',
      normal: 'text-blue-600',
      low: 'text-gray-600',
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Menu button for mobile */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-4"
        >
          {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Right side - Search & Notifications */}
      <div className="flex items-center space-x-2">
        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors group"
          title={`Search (${searchShortcut})`}
        >
          <FiSearch className="h-5 w-5" />
          <span className="text-sm text-gray-500 group-hover:text-gray-700">Search</span>
          <kbd className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
            {searchShortcut}
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onSearchClick}
          className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          title="Search"
        >
          <FiSearch className="h-6 w-6" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              // Alt-click opens dropdown, normal click navigates to full page
              if (e.altKey) {
                setShowNotifications(!showNotifications);
              } else {
                navigate('/notifications');
              }
            }}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
          >
            <FiBell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-semibold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-primary-100">{unreadCount} unread</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 hover:bg-primary-700 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {notifications.some((n) => n.read) && (
                    <button
                      onClick={handleClearRead}
                      className="p-1.5 hover:bg-primary-700 rounded-lg transition-colors"
                      title="Clear read notifications"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiBell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Icon */}
                          <span className="text-2xl mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className={`text-sm font-semibold ${getPriorityColor(notification.priority)}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 leading-snug">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-1.5">
                              <p className="text-xs text-gray-500">{notification.timeAgo}</p>
                              {notification.priority === 'urgent' && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <FiCheck className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    View all notifications
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        {notification.title && (
                          <p className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</p>
                        )}
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
