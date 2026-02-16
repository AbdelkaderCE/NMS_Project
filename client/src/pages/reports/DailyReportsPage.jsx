import { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiSend, FiCheck } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import DailyReportForm from '../../components/reports/DailyReportForm';
import DailyReportView from '../../components/reports/DailyReportView';
import { dailyReportAPI, childrenAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const DailyReportsPage = ({ onSearchClick }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    fetchChildren();
    fetchReports();
  }, [filter]);

  const fetchChildren = async () => {
    try {
      const response = await childrenAPI.getAll({ limit: 100 });
      const data = response.data?.data || response.data || [];
      setChildren(data);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (filter === 'today') {
        params.date = new Date().toISOString().split('T')[0];
      } else if (filter === 'week') {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (filter === 'pending') {
        params.status = 'draft';
      } else if (filter === 'completed') {
        params.status = 'completed';
      }

      const response = await dailyReportAPI.getAll(params);
      const data = response.data?.data || response.data || [];
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showAlert('error', 'Failed to load daily reports');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreateReport = (child) => {
    setSelectedChild(child);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowCreateModal(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleSendReport = async (reportId) => {
    try {
      await dailyReportAPI.send(reportId);
      showAlert('success', 'Report sent to parents!');
      fetchReports();
    } catch (error) {
      console.error('Failed to send report:', error);
      showAlert('error', error.response?.data?.message || 'Failed to send report');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'parent' 
                ? 'View daily reports for your children' 
                : 'Create and manage daily reports for children'}
            </p>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="today">Today's Reports</option>
              <option value="week">This Week</option>
              <option value="pending">Pending (Drafts)</option>
              <option value="completed">Completed</option>
              <option value="all">All Reports</option>
            </select>
          </div>
        </Card>

        {/* Quick Create Section (Today's Children) - Only for Staff */}
        {filter === 'today' && user.role !== 'parent' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Today's Reports
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : children.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No children found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child) => {
                  const hasReport = reports.find(r => r.child._id === child._id);
                  return (
                    <div key={child._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {child.photo ? (
                            <img src={child.photo} alt={child.firstName} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {child.firstName[0]}{child.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {child.firstName} {child.lastName}
                            </p>
                            {hasReport && (
                              <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(hasReport.status)}`}>
                                {hasReport.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={hasReport ? 'secondary' : 'primary'}
                          icon={hasReport ? FiEye : FiPlus}
                          onClick={() => hasReport ? handleViewReport(hasReport) : handleCreateReport(child)}
                        >
                          {hasReport ? 'View' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Reports List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found for selected filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {report.child?.firstName} {report.child?.lastName}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(report.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {report.notes && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{report.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={FiEye}
                      onClick={() => handleViewReport(report)}
                    >
                      View
                    </Button>
                    {user.role !== 'parent' && report.status === 'completed' && (
                      <Button
                        size="sm"
                        icon={FiSend}
                        onClick={() => handleSendReport(report._id)}
                      >
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedChild(null);
          }}
          title={`Daily Report - ${selectedChild?.firstName} ${selectedChild?.lastName}`}
          size="large"
        >
          {selectedChild && (
            <DailyReportForm
              child={selectedChild}
              date={selectedDate}
              onSave={() => {
                setShowCreateModal(false);
                fetchReports();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          )}
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedReport(null);
          }}
          title="Daily Report"
          size="large"
        >
          {selectedReport && <DailyReportView report={selectedReport} />}
        </Modal>
      </div>
    </Layout>
  );
};

export default DailyReportsPage;
