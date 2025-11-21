import { useState } from 'react';
import { FiBell, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications - will be replaced with real data later
  const notifications = [
    { id: 1, message: 'New child registered', time: '5 min ago', read: false },
    { id: 2, message: 'Payment received from John Doe', time: '1 hour ago', read: false },
    { id: 3, message: 'Staff meeting scheduled', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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

      {/* Right side - Notifications */}
      <div className="flex items-center space-x-4">
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
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
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
