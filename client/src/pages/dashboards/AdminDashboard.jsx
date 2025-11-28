import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api';
import { FiUsers, FiUserCheck, FiCalendar, FiDollarSign, FiActivity, FiMail, FiTrendingUp, FiUserPlus, FiBriefcase, FiCheckSquare, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI } from '../../api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onSearchClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch last 12 months of payment data by default, or custom range if set
      let startDate;
      
      if (dateRange.startDate) {
        startDate = dateRange.startDate;
      } else {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        startDate = twelveMonthsAgo.toISOString().split('T')[0];
      }
      
      const params = { startDate };
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }
      
      const [quickRes, payRes] = await Promise.all([
        dashboardAPI.getQuickStats(),
        paymentAPI.getStats(params).catch(() => ({ data: null }))
      ]);
      setStats(quickRes.data);
      setPaymentStats(payRes.data?.data || payRes.data); // controller wraps in data
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({});
      setPaymentStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyDateFilter = () => {
    setLoading(true);
    fetchAll();
  };

  const handleResetDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setLoading(true);
    fetchAll();
  };

  const statsCards = [
    { name: 'Total Children', value: stats?.children || 0, icon: FiUsers, color: 'bg-blue-500', link: '/children' },
    { name: 'Staff', value: stats?.staff || 0, icon: FiUserCheck, color: 'bg-green-500', link: '/staff' },
    { name: "Today's Attendance", value: stats?.todayAttendance || 0, icon: FiCalendar, color: 'bg-purple-500', link: '/attendance' },
    { name: 'Pending Payments', value: stats?.pendingPayments || 0, icon: FiDollarSign, color: 'bg-yellow-500', link: '/payments' },
    { name: 'Active Activities', value: 0, icon: FiActivity, color: 'bg-pink-500', link: '/activities' },
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
    <Layout onSearchClick={onSearchClick}>
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
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Common tasks to get you started</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/children', { state: { openAddModal: true } })}
              className="group p-5 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FiUserPlus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Add New Child</h3>
              <p className="text-sm text-gray-500">Register a new child in the system</p>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/staff', { state: { openAddModal: true } })}
                className="group p-5 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FiBriefcase className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Staff Member</h3>
                <p className="text-sm text-gray-500">Register new staff member</p>
              </button>
            )}

            <button
              onClick={() => navigate('/attendance', { state: { openAddModal: true } })}
              className="group p-5 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FiCheckSquare className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Mark Attendance</h3>
              <p className="text-sm text-gray-500">Record today's attendance</p>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/payments', { state: { openAddModal: true } })}
                className="group p-5 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <FiCreditCard className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Payment</h3>
                <p className="text-sm text-gray-500">Generate new invoice</p>
              </button>
            )}
          </div>
        </Card>

        {/* Payment Analytics (Admin Only) */}
        {user?.role === 'admin' && paymentStats && (
          <>
            {/* Date Range Filter */}
            <Card title="Payment Analytics Filters" subtitle="Customize date range for charts">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyDateFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleResetDateFilter}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Revenue History (Last 12 Months)" subtitle="Paid invoices trend">
              <div className="h-64 w-full" style={{ minHeight: '256px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <LineChart data={formatRevenue(paymentStats.revenueByMonth)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6B7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6B7280"
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#10B981' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Invoices by Status" subtitle="Current period distribution">
              <div className="h-64 w-full flex items-center justify-center" style={{ minHeight: '256px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <PieChart>
                    <Pie
                      data={formatStatus(paymentStats.byStatus)}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.status} (${entry.count})`}
                      labelLine={false}
                    >
                      {formatStatus(paymentStats.byStatus).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {formatStatus(paymentStats.byStatus).map(s => (
                  <div key={s.status} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[s.status] || '#94A3B8' }} />
                      <span className="capitalize">{s.status}</span>
                    </span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          </>
        )}

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

// Helper formatting functions and constants
const STATUS_COLORS = {
  pending: '#F59E0B',    // Amber/Yellow for pending
  PENDING: '#F59E0B',
  paid: '#10B981',       // Green for paid
  PAID: '#10B981',
  overdue: '#DC2626',    // Red for overdue
  OVERDUE: '#DC2626',
  refunded: '#6B7280',   // Gray for refunded
  REFUNDED: '#6B7280',
  cancelled: '#6B7280',  // Gray for cancelled
  CANCELLED: '#6B7280',
};

function formatRevenue(revenueByMonth = []) {
  return revenueByMonth.map(r => ({ month: r._id, revenue: r.revenue }));
}

function formatStatus(byStatus = []) {
  return byStatus.map(s => ({ status: s._id, count: s.count, total: s.total }));
}
