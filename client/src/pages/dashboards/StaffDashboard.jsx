import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api';
import { FiUsers, FiCalendar, FiActivity, FiMail, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StaffDashboard = ({ onSearchClick }) => {
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
    { name: "Today's Attendance", value: stats?.todayAttendance || 0, icon: FiCalendar, color: 'bg-purple-500', link: '/attendance' },
    { name: 'Today\'s Activities', value: 0, icon: FiActivity, color: 'bg-pink-500', link: '/activities' },
    { name: 'Unread Messages', value: stats?.unreadMessages || 0, icon: FiMail, color: 'bg-indigo-500', link: '/messages' },
  ];

  if (loading) {
    return (
      <Layout onSearchClick={onSearchClick}>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your daily tasks and activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Today's Tasks */}
        <Card title="Today's Tasks" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}>
          <div className="space-y-4">
            <Link to="/attendance/mark" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FiCalendar className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
                  <p className="text-sm text-gray-500">Record children's attendance for today</p>
                </div>
              </div>
              <span className="text-purple-600 font-medium">Start →</span>
            </Link>

            <Link to="/activities" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FiActivity className="h-5 w-5 text-pink-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Today's Activities</h3>
                  <p className="text-sm text-gray-500">{stats?.todayActivities || 0} activities scheduled</p>
                </div>
              </div>
              <span className="text-pink-600 font-medium">View →</span>
            </Link>

            <Link to="/messages" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Check Messages</h3>
                  <p className="text-sm text-gray-500">{stats?.unreadMessages || 0} unread messages</p>
                </div>
              </div>
              <span className="text-indigo-600 font-medium">View →</span>
            </Link>
          </div>
        </Card>

        {/* Children Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="My Children" subtitle={`${stats?.totalChildren || 0} children under your care`}>
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
                <p className="text-gray-500 text-center py-4">No children assigned yet</p>
              )}
              <Link to="/children" className="block text-center text-primary-600 hover:text-primary-700 font-medium pt-2">
                View All Children →
              </Link>
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Present Today</span>
                </div>
                <span className="font-semibold text-green-600">{stats?.todayAttendance || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiActivity className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-gray-700">Completed Activities</span>
                </div>
                <span className="font-semibold text-pink-600">{stats?.completedActivities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">Messages Sent</span>
                </div>
                <span className="font-semibold text-indigo-600">{stats?.messagesSent || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
