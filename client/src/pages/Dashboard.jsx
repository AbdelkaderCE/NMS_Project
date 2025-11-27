import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import ParentDashboard from './dashboards/ParentDashboard';

const Dashboard = ({ onSearchClick }) => {
  const { user } = useAuth();

  // Route to role-specific dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard onSearchClick={onSearchClick} />;
  }
  
  if (user?.role === 'staff') {
    return <StaffDashboard onSearchClick={onSearchClick} />;
  }
  
  if (user?.role === 'parent') {
    return <ParentDashboard onSearchClick={onSearchClick} />;
  }

  // Fallback to admin dashboard if role is not recognized
  return <AdminDashboard onSearchClick={onSearchClick} />;
};

export default Dashboard;
