import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiUserCheck, 
  FiCalendar, 
  FiDollarSign, 
  FiActivity, 
  FiMail,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiLayers,
  FiMessageCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, roles: ['admin', 'staff', 'parent'] },
    { name: 'Children', href: '/children', icon: FiUsers, roles: ['admin', 'staff', 'parent'] },
    { name: 'Parents', href: '/parents', icon: FiUsers, roles: ['admin', 'staff'] },
    { name: 'Educators', href: '/staff', icon: FiUserCheck, roles: ['admin'] },
    { name: 'Classes', href: '/classes', icon: FiGrid, roles: ['admin', 'staff'] },
    { name: 'Groups', href: '/groups', icon: FiLayers, roles: ['admin', 'staff'] },
    { name: 'Attendance', href: '/attendance', icon: FiCalendar, roles: ['admin', 'staff'] },
    { name: 'Payments', href: '/payments', icon: FiDollarSign, roles: ['admin', 'staff', 'parent'] },
    { name: 'Activities', href: '/activities', icon: FiActivity, roles: ['admin', 'staff'] },
    { name: 'Calendar', href: '/activities/calendar', icon: FiCalendar, roles: ['admin', 'staff', 'parent'] },
    { name: 'Messages', href: '/messages', icon: FiMail, roles: ['admin', 'staff', 'parent'] },
    { name: 'Chat', href: '/chat', icon: FiMessageCircle, roles: ['admin', 'staff', 'parent'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">NMS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-primary-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <Link
          to="/settings"
          className="flex items-center w-full px-3 py-2 mb-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FiSettings className="mr-3 h-5 w-5 text-gray-400" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
