import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import ParentDashboard from './dashboards/ParentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to role-specific dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }
  
  if (user?.role === 'parent') {
    return <ParentDashboard />;
  }

  // Fallback to admin dashboard if role is not recognized
  return <AdminDashboard />;
};

export default Dashboard;
