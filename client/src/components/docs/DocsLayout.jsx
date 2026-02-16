import { useState } from 'react';
import DocsNavigation from './DocsNavigation';
import Navbar from '../layout/Navbar';

const DocsLayout = ({ children, onSearchClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50">
      {/* Docs Sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <DocsNavigation />
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
            <DocsNavigation />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onMenuClick={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          onSearchClick={onSearchClick}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
