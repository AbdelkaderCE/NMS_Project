import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api';
import { FiUsers, FiUserCheck, FiCalendar, FiDollarSign, FiActivity, FiMail, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getQuickStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default empty stats on error
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { name: 'Total Children', value: stats?.children || 0, icon: FiUsers, color: 'bg-blue-500', link: '/children' },
    { name: 'Educators', value: stats?.staff || 0, icon: FiUserCheck, color: 'bg-green-500', link: '/staff' },
    { name: "Today's Attendance", value: stats?.todayAttendance || 0, icon: FiCalendar, color: 'bg-purple-500', link: '/attendance' },
    { name: 'Pending Payments', value: stats?.pendingPayments || 0, icon: FiDollarSign, color: 'bg-yellow-500', link: '/payments' },
    { name: 'Active Activities', value: 0, icon: FiActivity, color: 'bg-pink-500', link: '/activities' },
    { name: 'Unread Messages', value: stats?.unreadMessages || 0, icon: FiMail, color: 'bg-indigo-500', link: '/messages' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your nursery operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/children/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Add New Child</h3>
              <p className="text-sm text-gray-500 mt-1">Register a new child</p>
            </Link>
            <Link to="/staff/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Add Educator</h3>
              <p className="text-sm text-gray-500 mt-1">Register new educator</p>
            </Link>
            <Link to="/attendance/mark" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
              <p className="text-sm text-gray-500 mt-1">Record today's attendance</p>
            </Link>
            <Link to="/payments/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500 mt-1">Add payment record</p>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Recent Enrollments">
            <div className="space-y-3">
              {stats?.recentChildren?.length > 0 ? (
                stats.recentChildren.map((child) => (
                  <div key={child._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{child.firstName} {child.lastName}</p>
                      <p className="text-sm text-gray-500">Age: {child.age}</p>
                    </div>
                    <Link to={`/children/${child._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent enrollments</p>
              )}
            </div>
          </Card>

          <Card title="Pending Actions">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Pending payment confirmations</span>
                <span className="font-semibold text-yellow-600">{stats?.pendingPayments || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Unread messages</span>
                <span className="font-semibold text-indigo-600">{stats?.unreadMessages || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Upcoming activities</span>
                <span className="font-semibold text-pink-600">{stats?.upcomingActivities || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
