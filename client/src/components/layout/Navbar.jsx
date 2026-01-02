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
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiBell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
