import { Link, useLocation } from 'react-router-dom';
import { 
  FiBook, 
  FiInfo, 
  FiTarget, 
  FiCode, 
  FiFileText, 
  FiLayers, 
  FiTool, 
  FiCheckCircle,
  FiAward,
  FiArrowLeft
} from 'react-icons/fi';

const DocsNavigation = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/docs', icon: FiBook },
    { name: 'Introduction', href: '/docs/introduction', icon: FiInfo },
    { name: 'Objectives', href: '/docs/objectives', icon: FiTarget },
    { name: 'Technologies', href: '/docs/technologies', icon: FiCode },
    { name: 'Analysis', href: '/docs/analysis', icon: FiFileText },
    { name: 'Design', href: '/docs/design', icon: FiLayers },
    { name: 'Implementation', href: '/docs/implementation', icon: FiTool },
    { name: 'Testing', href: '/docs/testing', icon: FiCheckCircle },
    { name: 'Conclusion', href: '/docs/conclusion', icon: FiAward },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900/95 to-blue-800/95 border-r border-blue-700/40 text-white">
      {/* Logo / Title */}
      <div className="flex items-center justify-center h-16 border-b border-blue-700/40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">
          Documentation
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navigation.map((item) => {
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

      {/* Back to Dashboard */}
      <div className="border-t border-blue-700/40 p-4 bg-blue-800/50">
        <Link
          to="/dashboard"
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700/40 transition-all"
        >
          <FiArrowLeft className="mr-3 h-5 w-5 text-blue-200/60" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default DocsNavigation;
