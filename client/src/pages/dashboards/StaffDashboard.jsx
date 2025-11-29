import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api';
import { FiUsers, FiCalendar, FiActivity, FiMail, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = ({ onSearchClick }) => {
  const { user } = useAuth();
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
        <div className="backdrop-blur-sm bg-white/40 border border-blue-200/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Staff Dashboard</h1>
          <p className="text-blue-600/70 mt-1">Manage your daily tasks and activities</p>
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
            {/* Only teachers and assistants can mark attendance */}
            {(user?.staffInfo?.position === 'teacher' || user?.staffInfo?.position === 'assistant') && (
              <Link to="/attendance" className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiCalendar className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
                    <p className="text-sm text-gray-600">Record children's attendance for today</p>
                  </div>
                </div>
                <span className="text-purple-600 font-medium">Start →</span>
              </Link>
            )}

            {/* Only teachers, assistants, and managers can view activities */}
            {(user?.staffInfo?.position === 'teacher' || 
              user?.staffInfo?.position === 'assistant' || 
              user?.staffInfo?.position === 'manager') && (
              <Link to="/activities" className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiActivity className="h-5 w-5 text-pink-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">View Today's Activities</h3>
                    <p className="text-sm text-gray-600">{stats?.todayActivities || 0} activities scheduled</p>
                  </div>
                </div>
                <span className="text-pink-600 font-medium">View →</span>
              </Link>
            )}

            <Link to="/messages" className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Check Messages</h3>
                  <p className="text-sm text-gray-600">{stats?.unreadMessages || 0} unread messages</p>
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
                  <div key={child._id} className="flex items-center justify-between py-2 border-b border-blue-200/20 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{child.firstName} {child.lastName}</p>
                      <p className="text-sm text-gray-600">Age: {child.age}</p>
                    </div>
                    <Link to={`/children/${child._id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No children assigned yet</p>
              )}
              <Link to="/children" className="block text-center text-blue-600 hover:text-blue-700 font-medium pt-2 transition-colors">
                View All Children →
              </Link>
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-blue-200/20">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Present Today</span>
                </div>
                <span className="font-semibold text-green-600 bg-green-50/50 px-3 py-1 rounded-lg">{stats?.todayAttendance || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200/20">
                <div className="flex items-center">
                  <FiActivity className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-gray-700">Completed Activities</span>
                </div>
                <span className="font-semibold text-pink-600 bg-pink-50/50 px-3 py-1 rounded-lg">{stats?.completedActivities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">Messages Sent</span>
                </div>
                <span className="font-semibold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg">{stats?.messagesSent || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
