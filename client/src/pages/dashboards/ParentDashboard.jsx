import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { dashboardAPI, dailyReportAPI } from '../../api';
import { FiUsers, FiDollarSign, FiActivity, FiMail, FiCalendar, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ParentDashboard = ({ onSearchClick }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyReports, setDailyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchLatestReports();
  }, []);

  const fetchLatestReports = async () => {
    try {
      setReportsLoading(true);
      const response = await dailyReportAPI.getAll({ limit: 5, status: 'sent' });
      const reports = response.data?.data || response.data || [];
      setDailyReports(reports);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      setDailyReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

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
    { name: 'My Children', value: stats?.myChildren || 0, icon: FiUsers, color: 'bg-blue-500', link: '/children' },
    { name: 'Pending Payments', value: stats?.pendingPayments || 0, icon: FiDollarSign, color: 'bg-yellow-500', link: '/payments' },
    { name: "Today's Attendance", value: stats?.todayAttendance || 0, icon: FiActivity, color: 'bg-pink-500', link: '/attendance' },
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
        <div className="flex items-center justify-between backdrop-blur-sm bg-white/40 border border-blue-200/30 rounded-xl p-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Parent Dashboard</h1>
            <p className="text-blue-600/70 mt-1">Monitor your children's progress and activities</p>
          </div>
          <Link to="/children/enroll">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg">
              <FiUsers className="h-5 w-5" />
              Register New Child
            </button>
          </Link>
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

        {/* My Children */}
        <Card title="My Children">
          <div className="space-y-4">
            {stats?.children?.length > 0 ? (
              stats.children.map((child) => (
                <div key={child._id} className="p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{child.firstName} {child.lastName}</h3>
                      <p className="text-sm text-gray-600 mt-1">Age: {child.age} years • Class: {child.classroom || 'Not assigned'}</p>
                    </div>
                    <Link to={`/children/${child._id}`} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      View Details →
                    </Link>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/20">
                    <div>
                      <p className="text-xs text-gray-600">Attendance This Month</p>
                      <p className="text-lg font-semibold text-green-600">{child.attendanceRate || 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Activities Participated</p>
                      <p className="text-lg font-semibold text-pink-600">{child.activitiesCount || 0}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No children registered yet</p>
                <Link to="/children/enroll" className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block transition-colors">
                  Register your child →
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Latest Daily Reports */}
        <Card title="Latest Daily Reports" subtitle="Recent activity reports from school">
          {reportsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : dailyReports.length === 0 ? (
            <Link to="/daily-reports" className="block p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">No Reports Yet</h3>
                    <p className="text-sm text-gray-600">Daily reports from school will appear here</p>
                  </div>
                </div>
                <span className="text-indigo-600 font-medium">View All →</span>
              </div>
            </Link>
          ) : (
            <div className="space-y-3">
              {dailyReports.map(report => (
                <Link key={report._id} to="/daily-reports" className="block p-4 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {report.child?.firstName} {report.child?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </p>
                      {report.notes && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">"{report.notes}"</p>
                      )}
                    </div>
                    <span className="text-indigo-600 font-medium">View →</span>
                  </div>
                </Link>
              ))}
              {dailyReports.length > 0 && (
                <Link to="/daily-reports" className="block text-center p-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm bg-indigo-50 rounded-lg">
                  View all reports
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* Quick Actions & Info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link to="/payments" className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiDollarSign className="h-5 w-5 text-amber-600 mr-3" />
                  <span className="font-medium text-gray-900">View Payments</span>
                </div>
                <span className="text-sm text-gray-600">→</span>
              </Link>

              <Link to="/activities/calendar" className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiActivity className="h-5 w-5 text-pink-600 mr-3" />
                  <span className="font-medium text-gray-900">View Activity Calendar</span>
                </div>
                <span className="text-sm text-gray-600">→</span>
              </Link>

              <Link to="/messages" className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-900">Send Message</span>
                </div>
                <span className="text-sm text-gray-600">→</span>
              </Link>

              <Link to="/attendance" className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 border border-blue-200/30 rounded-lg hover:bg-white/70 hover:border-blue-300/50 transition-all shadow-sm">
                <div className="flex items-center">
                  <FiCalendar className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Attendance History</span>
                </div>
                <span className="text-sm text-gray-600">→</span>
              </Link>
            </div>
          </Card>

          <Card title="Payment Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-blue-200/20">
                <span className="text-gray-700">Total Paid This Month</span>
                <span className="font-semibold text-green-600 bg-green-50/50 px-3 py-1 rounded-lg">${stats?.totalPaid || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200/20">
                <span className="text-gray-700">Pending Amount</span>
                <span className="font-semibold text-amber-600 bg-amber-50/50 px-3 py-1 rounded-lg">${stats?.pendingAmount || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200/20">
                <span className="text-gray-700">Next Payment Due</span>
                <span className="font-semibold text-gray-900">{stats?.nextPaymentDue || 'N/A'}</span>
              </div>
              <Link to="/payments" className="block text-center text-blue-600 hover:text-blue-700 font-medium pt-2 transition-colors">
                View All Payments →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
