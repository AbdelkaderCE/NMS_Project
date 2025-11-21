import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <Sidebar />
        </div>
      </aside>

      {/* Sidebar for mobile */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-64 z-30 lg:hidden">
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
