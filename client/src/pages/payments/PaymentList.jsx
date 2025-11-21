import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiDollarSign, FiCreditCard, FiDownload, FiTrash2, FiCheck } from 'react-icons/fi';
import { paymentAPI, userAPI } from '../../api';
import { childrenAPI } from '../../api';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    child: '',
    parent: '',
    type: 'tuition',
    amount: '',
    dueDate: '',
    description: '',
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    method: 'cash',
    transactionId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, childrenRes] = await Promise.all([
        paymentAPI.getAll(),
        childrenAPI.getAll(),
      ]);
      setPayments(paymentsRes.data);
      setChildren(childrenRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      // Find the selected child to get parent info
      const selectedChild = children.find(c => c._id === invoiceForm.child);
      
      // Get parent ID - prioritize logged-in parent user, otherwise use child's first parent
      let parentId = invoiceForm.parent;
      
      // If no parent set or current user is a parent, use current user's ID
      if (user?.role === 'parent') {
        parentId = user._id;
      } else if (!parentId && selectedChild?.parents?.length > 0) {
        // Get the parent user ID from child's parents array
        const firstParent = selectedChild.parents[0];
        parentId = firstParent?.parent?._id || firstParent?.parent || firstParent?._id || firstParent;
      }
      
      // If still no parent, try to use the user who created the child (admin/staff)
      if (!parentId) {
        parentId = user._id;
      }

      // Transform the form data to match backend structure
      const itemAmount = parseFloat(invoiceForm.amount);
      const dueDate = new Date(invoiceForm.dueDate);
      
      // Set billing period: start date is today, end date is due date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const paymentData = {
        child: invoiceForm.child,
        parent: parentId,
        type: invoiceForm.type,
        amount: itemAmount,
        dueDate: invoiceForm.dueDate,
        billingPeriod: {
          startDate: today.toISOString().split('T')[0],
          endDate: invoiceForm.dueDate
        },
        items: [
          {
            description: invoiceForm.description || `${invoiceForm.type} payment`,
            quantity: 1,
            unitPrice: itemAmount,
            amount: itemAmount,
            total: itemAmount
          }
        ],
        discount: 0,
        tax: 0
      };
      
      console.log('Creating invoice with data:', paymentData);
      console.log('Selected child:', selectedChild);
      console.log('Parent ID:', parentId);
      
      const response = await paymentAPI.create(paymentData);
      
      setAlert({ type: 'success', message: 'Invoice created successfully!' });
      setShowInvoiceModal(false);
      setInvoiceForm({
        child: '',
        parent: '',
        type: 'tuition',
        amount: '',
        dueDate: '',
        description: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      let errorMessage = 'Failed to create invoice';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.message || e.msg).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({ 
        type: 'error', 
        message: errorMessage
      });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      // Transform data to match backend expectations
      const paymentData = {
        paymentMethod: paymentForm.method,
        transactionId: paymentForm.transactionId || undefined,
      };
      
      await paymentAPI.recordPayment(selectedInvoice._id, paymentData);
      setAlert({ type: 'success', message: 'Payment recorded successfully!' });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentForm({
        method: 'cash',
        transactionId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
      
      let errorMessage = 'Failed to record payment';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.message).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await paymentAPI.delete(id);
      setAlert({ type: 'success', message: 'Invoice deleted successfully!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setAlert({ type: 'error', message: 'Failed to delete invoice' });
    }
  };

  const openPaymentModal = (payment) => {
    setSelectedInvoice(payment);
    setPaymentForm({
      ...paymentForm,
      amount: payment.status === 'paid' ? '0' : payment.amount.toString(),
    });
    setShowPaymentModal(true);
  };

  // Filter payments based on status and search
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const childName = payment.child?.firstName + ' ' + payment.child?.lastName || '';
    const matchesSearch = childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments
      .filter((p) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0),
    overdueCount: payments.filter((p) => p.status === 'overdue').length,
    paidCount: payments.filter((p) => p.status === 'paid').length,
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
            <p className="text-gray-600 mt-1">Manage tuition fees and payments</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Button onClick={() => setShowInvoiceModal(true)} icon={FiPlus}>
            Create Invoice
          </Button>
        )}
      </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700 mt-1">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <FiDollarSign className="text-green-700 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">${stats.pendingAmount.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-lg">
                <FiCreditCard className="text-yellow-700 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Overdue Invoices</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{stats.overdueCount}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <FiTrash2 className="text-red-700 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Paid Invoices</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.paidCount}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <FiCheck className="text-blue-700 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by child name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.child?.firstName} {payment.child?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Age: {payment.child?.age}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{payment.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${payment.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      ${(payment.amountPaid || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.status !== 'paid' && payment.status !== 'cancelled' && (
                            <button
                              onClick={() => openPaymentModal(payment)}
                              className="text-green-600 hover:text-green-900"
                              title="Record Payment"
                            >
                              <FiDollarSign />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Invoice"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Create New Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child *
            </label>
            <select
              value={invoiceForm.child}
              onChange={(e) => {
                const selectedChild = children.find(c => c._id === e.target.value);
                
                // Extract parent ID correctly from the parents array structure
                let extractedParentId = '';
                if (selectedChild?.parents && selectedChild.parents.length > 0) {
                  const firstParent = selectedChild.parents[0];
                  // The parent can be populated (object with _id) or just an ID string
                  extractedParentId = firstParent?.parent?._id || firstParent?.parent || firstParent?._id || '';
                }
                
                setInvoiceForm({ 
                  ...invoiceForm, 
                  child: e.target.value,
                  parent: extractedParentId
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.firstName} {child.lastName} (Age: {child.age})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <select
              value={invoiceForm.type}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="tuition">Tuition</option>
              <option value="meal">Meal</option>
              <option value="transportation">Transportation</option>
              <option value="activity">Activity</option>
              <option value="registration">Registration</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <Input
              type="date"
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={invoiceForm.description}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter invoice description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowInvoiceModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {selectedInvoice && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Invoice Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Invoice #:</span>{' '}
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                </p>
                <p>
                  <span className="text-gray-600">Child:</span>{' '}
                  <span className="font-medium">
                    {selectedInvoice.child?.firstName} {selectedInvoice.child?.lastName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Total Amount:</span>{' '}
                  <span className="font-medium">${selectedInvoice.amount.toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-600">Already Paid:</span>{' '}
                  <span className="font-medium text-green-600">
                    ${selectedInvoice.status === 'paid' ? selectedInvoice.amount.toFixed(2) : '0.00'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Balance Due:</span>{' '}
                  <span className="font-medium text-red-600">
                    ${selectedInvoice.status === 'paid' ? '0.00' : selectedInvoice.amount.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <Input
              type="text"
              value={paymentForm.transactionId}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              placeholder="Enter transaction ID (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={selectedInvoice ? selectedInvoice.amount : undefined}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <Input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>
      </div>
    </Layout>
  );
};

export default PaymentList;
