import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { auditLogAPI } from '../../api';
import { FiSearch, FiRefreshCw, FiEye, FiFilter } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const ACTIONS = ['CREATE','UPDATE','DELETE','ACTIVATE','DEACTIVATE','PAYMENT'];
const RESOURCE_TYPES = ['Payment','Child','Staff','User'];

const AuditLogList = ({ onSearchClick }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    action: 'all',
    resourceType: 'all',
    startDate: '',
    endDate: '',
    search: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 50 };
      if (filters.action !== 'all') params.action = filters.action;
      if (filters.resourceType !== 'all') params.resourceType = filters.resourceType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await auditLogAPI.getAll(params);
      const data = res.data?.data || res.data; // handle either direct array or wrapped
      const pagination = res.data?.pagination;
      setLogs(data || []);
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
      setError(e.response?.data?.message || e.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); /* eslint-disable-next-line */ }, [page]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({ action: 'all', resourceType: 'all', startDate: '', endDate: '', search: '' });
    setPage(1);
    fetchLogs();
  };

  // Client-side search across resourceName, userName, description
  const displayedLogs = logs.filter(log => {
    if (!filters.search) return true;
    const haystack = `${log.resourceName||''} ${log.userName||''} ${log.description||''}`.toLowerCase();
    return haystack.includes(filters.search.toLowerCase());
  });

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track system changes and user actions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" icon={FiFilter} onClick={() => setFiltersOpen(v=>!v)}>
              {filtersOpen ? 'Hide Filters' : 'Filters'}
            </Button>
            <Button variant="secondary" icon={FiRefreshCw} onClick={fetchLogs}>Refresh</Button>
          </div>
        </div>

        {filtersOpen && (
          <form onSubmit={applyFilters} className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select value={filters.action} onChange={e=>setFilters({...filters, action:e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="all">All</option>
                  {ACTIONS.map(a=> <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                <select value={filters.resourceType} onChange={e=>setFilters({...filters, resourceType:e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="all">All</option>
                  {RESOURCE_TYPES.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={filters.startDate} onChange={e=>setFilters({...filters, startDate:e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={filters.endDate} onChange={e=>setFilters({...filters, endDate:e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <FiSearch className="absolute left-3 top-9 text-gray-400" />
                <input type="text" value={filters.search} onChange={e=>setFilters({...filters, search:e.target.value})} placeholder="User, resource, description" className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={resetFilters}>Reset</Button>
              <Button type="submit">Apply</Button>
            </div>
          </form>
        )}

        {error && <Alert type="error" message={error} onClose={()=>setError(null)} />}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center"><Loading /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Resource</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedLogs.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No audit logs found</td></tr>
                  )}
                  {displayedLogs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.userName || 'System'} <span className="text-xs text-gray-500">({log.userRole})</span></td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${log.action === 'DELETE' ? 'bg-red-100 text-red-700 border-red-200' : log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 border-blue-200' : log.action === 'CREATE' ? 'bg-green-100 text-green-700 border-green-200' : log.action === 'PAYMENT' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.resourceType}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.resourceName || '-'}</td>
                      <td className="px-4 py-2 max-w-md truncate" title={log.description}>{log.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {log.changes ? (
                          <button onClick={()=>setSelectedLog(log)} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"><FiEye /><span>View</span></button>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
              <div className="space-x-2">
                <Button variant="secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</Button>
                <Button variant="secondary" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal isOpen={!!selectedLog} onClose={()=>setSelectedLog(null)} title="Audit Log Details">
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-gray-500">Resource</p>
                  <p className="font-medium">{selectedLog.resourceType} {selectedLog.resourceName && `- ${selectedLog.resourceName}`}</p>
                </div>
                <div>
                  <p className="text-gray-500">User</p>
                  <p className="font-medium">{selectedLog.userName || 'System'} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Description</p>
                <p className="bg-gray-50 p-3 rounded border text-gray-700 leading-relaxed">{selectedLog.description}</p>
              </div>
              {selectedLog.changes && (
                <div>
                  <p className="text-gray-500 mb-2">Changes</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(selectedLog.changes).map(([field, diff]) => (
                      <div key={field} className="bg-white border rounded p-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">{field}</p>
                        {typeof diff === 'object' && ('old' in diff || 'new' in diff) ? (
                          <div className="flex text-xs space-x-4">
                            <div className="flex-1">
                              <p className="text-gray-500">Old</p>
                              <p className="font-mono break-all">{JSON.stringify(diff.old)}</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-500">New</p>
                              <p className="font-mono break-all">{JSON.stringify(diff.new)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="font-mono text-xs break-all">{JSON.stringify(diff)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={()=>setSelectedLog(null)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AuditLogList;
