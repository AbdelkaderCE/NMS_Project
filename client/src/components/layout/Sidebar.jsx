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
  FiMessageCircle,
  FiFileText,
  FiShield,
  FiUser,
  FiBriefcase
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, roles: ['admin', 'staff', 'parent'], staffPositions: ['teacher', 'assistant', 'manager'] },
    { name: 'Children', href: '/children', icon: FiUsers, roles: ['admin', 'staff', 'parent'], staffPositions: ['teacher', 'assistant', 'manager', 'nurse', 'receptionist'] },
    { name: 'Parents', href: '/parents', icon: FiUser, roles: ['admin', 'staff'], staffPositions: ['manager', 'receptionist'] },
    { name: 'Staff', href: '/staff', icon: FiBriefcase, roles: ['admin', 'staff'], staffPositions: ['manager'] },
    { name: 'Classes', href: '/classes', icon: FiGrid, roles: ['admin', 'staff'], staffPositions: ['manager'] },
    { name: 'Groups', href: '/groups', icon: FiLayers, roles: ['admin', 'staff'], staffPositions: ['manager'] },
    { name: 'Attendance', href: '/attendance', icon: FiCalendar, roles: ['admin', 'staff'], staffPositions: ['teacher', 'assistant'] },
    { name: 'Daily Reports', href: '/daily-reports', icon: FiFileText, roles: ['admin', 'staff', 'parent'], staffPositions: ['teacher', 'assistant'] },
    { name: 'Absence Excuses', href: '/absence-excuses', icon: FiFileText, roles: ['admin', 'staff'], staffPositions: ['teacher'] },
    { name: 'Payments', href: '/payments', icon: FiDollarSign, roles: ['admin', 'parent', 'staff'], staffPositions: ['receptionist'] },
    { name: 'Activities', href: '/activities', icon: FiActivity, roles: ['admin', 'staff'], staffPositions: ['teacher', 'assistant', 'manager'] },
    { name: 'Calendar', href: '/activities/calendar', icon: FiCalendar, roles: ['admin', 'staff', 'parent'] },
    { name: 'Messages', href: '/messages', icon: FiMail, roles: ['admin', 'staff', 'parent'] },
    { name: 'Chat', href: '/chat', icon: FiMessageCircle, roles: ['admin', 'staff', 'parent'] },
    { name: 'Enrollment Requests', href: '/enrollment/requests', icon: FiFileText, roles: ['admin', 'staff'], staffPositions: ['manager', 'receptionist'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: FiShield, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    // Check role permission
    if (!item.roles.includes(user?.role)) {
      return false;
    }
    
    // For staff, check position-specific permissions
    if (user?.role === 'staff' && item.staffPositions) {
      // Get user's position
      const userPosition = user?.staffInfo?.position;
      
      // If no position found or position not in allowed list, hide the menu item
      if (!userPosition || !item.staffPositions.includes(userPosition)) {
        return false;
      }
    }
    
    return true;
  });

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900/95 to-blue-800/95 border-r border-blue-700/40 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-blue-700/40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">NMS</h1>
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
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-500/20 text-blue-100 border-l-2 border-blue-300'
                    : 'text-blue-100/70 hover:bg-blue-700/40 hover:text-blue-50'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-300' : 'text-blue-200/60'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-blue-700/40 p-4 bg-blue-800/50">
        <div className="mb-3">
          <p className="text-sm font-medium text-blue-100 truncate">{user?.name}</p>
          <p className="text-xs text-blue-200/60 capitalize">{user?.role}</p>
        </div>
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center w-full px-3 py-2 mb-2 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700/40 transition-all"
        >
          <FiUser className="mr-3 h-5 w-5 text-blue-200/60" />
          My Profile
        </Link>
        <Link
          to="/settings"
          className="flex items-center w-full px-3 py-2 mb-2 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700/40 transition-all"
        >
          <FiSettings className="mr-3 h-5 w-5 text-blue-200/60" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-300 rounded-lg hover:bg-red-500/20 transition-all"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
