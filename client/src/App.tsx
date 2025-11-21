import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ChildrenList from './pages/children/ChildrenList';
import StaffList from './pages/staff/StaffList';
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

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
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
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/children"
            element={
              <PrivateRoute>
                <ChildrenList />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <StaffList />
              </PrivateRoute>
            }
          />
          <Route
            path="/parents"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']}>
                <ParentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AttendanceList />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <PaymentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <PrivateRoute>
                <ActivityList />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities/calendar"
            element={
              <PrivateRoute>
                <ActivityCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <PrivateRoute>
                <ClassList />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <GroupList />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessageList />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatView />
              </PrivateRoute>
            }
          />
          <Route
            path="/enrollment/requests"
            element={
              <PrivateRoute allowedRoles={['admin', 'staff']}>
                <EnrollmentRequestList />
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
