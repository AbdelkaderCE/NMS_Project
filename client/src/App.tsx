import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ChildrenList from './pages/children/ChildrenList';
import ChildEnrollmentForm from './pages/children/ChildEnrollmentForm';
import ChildProfile from './pages/children/ChildProfile';
import StaffList from './pages/staff/StaffList';
import StaffProfile from './pages/staff/StaffProfile';
import AttendanceList from './pages/attendance/AttendanceList';
import PaymentList from './pages/payments/PaymentList';
import ParentList from './pages/parents/ParentList';
import ActivityList from './pages/activities/ActivityList';
import ActivityCalendar from './pages/activities/ActivityCalendar';
import ClassList from './pages/classes/ClassList';
import GroupList from './pages/groups/GroupList';
import MessageList from './pages/messages/MessageList';
import ChatView from './pages/messages/ChatView';
import LandingPage from './pages/public/LandingPage';
import PublicEnrollmentForm from './pages/public/PublicEnrollmentForm';
import EnrollmentRequestList from './pages/enrollment/EnrollmentRequestList';
import AuditLogList from './pages/audit/AuditLogList';
import NotificationsPage from './pages/notifications/NotificationsPage';
import UserProfile from './pages/profile/UserProfile';
import SearchModal from './components/search/SearchModal';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<PublicEnrollmentForm />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/children"
            element={
              <PrivateRoute>
                <ChildrenList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/children/enroll"
            element={
              <PrivateRoute allowedRoles={['parent']}>
                <ChildEnrollmentForm onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/children/:id"
            element={
              <PrivateRoute>
                <ChildProfile onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager']}>
                <StaffList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager']}>
                <StaffProfile onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/parents"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager', 'receptionist']}>
                <ParentList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['teacher', 'assistant']}>
                <AttendanceList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute allowedRoles={['admin','parent', 'staff']} allowedPositions={['receptionist']}>
                <PaymentList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['teacher', 'assistant', 'manager']}>
                <ActivityList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities/calendar"
            element={
              <PrivateRoute>
                <ActivityCalendar onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager']}>
                <ClassList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager']}>
                <GroupList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessageList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatView onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/enrollment/requests"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']} allowedPositions={['manager', 'receptionist']}>
                <EnrollmentRequestList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AuditLogList onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <UserProfile onSearchClick={handleSearchClick} />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <div>Settings Page - Coming Soon</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </SocketProvider>
    </AuthProvider>
  );
}

export default App;
