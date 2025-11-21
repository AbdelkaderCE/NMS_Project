import { useState, useEffect } from 'react';
import { FiSend, FiInbox, FiMail, FiArchive, FiSearch, FiUser, FiUsers } from 'react-icons/fi';
import { messageAPI, userAPI } from '../../api';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox'); // inbox, sent, archived
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal',
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    fetchUnreadCount();
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'inbox') {
        response = await messageAPI.getInbox();
      } else if (activeTab === 'sent') {
        response = await messageAPI.getSent();
      } else if (activeTab === 'archived') {
        response = await messageAPI.getArchived();
      }
      
      // Extract messages from paginated response
      // The paginated response has data directly in response.data (not nested)
      const messageData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMessages(messageData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setAlert({ type: 'error', message: 'Failed to load messages' });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messageAPI.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await messageAPI.send(formData);
      setAlert({ type: 'success', message: 'Message sent successfully!' });
      resetForm();
      if (activeTab === 'sent') {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send message' 
      });
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
    
    // Mark as read if it's in inbox and unread
    if (activeTab === 'inbox' && !message.isRead) {
      try {
        await messageAPI.markAsRead(message._id);
        fetchMessages();
        fetchUnreadCount();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await messageAPI.archive(messageId);
      setAlert({ type: 'success', message: 'Message archived successfully!' });
      fetchMessages();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error archiving message:', error);
      setAlert({ type: 'error', message: 'Failed to archive message' });
    }
  };

  const handleUnarchive = async (messageId) => {
    try {
      await messageAPI.unarchive(messageId);
      setAlert({ type: 'success', message: 'Message restored successfully!' });
      fetchMessages();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error unarchiving message:', error);
      setAlert({ type: 'error', message: 'Failed to restore message' });
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageAPI.delete(messageId);
      setAlert({ type: 'success', message: 'Message deleted successfully!' });
      fetchMessages();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      setAlert({ type: 'error', message: 'Failed to delete message' });
    }
  };

  const resetForm = () => {
    setFormData({
      recipient: '',
      subject: '',
      content: '',
      priority: 'normal',
    });
    setShowComposeModal(false);
  };

  const filteredMessages = messages.filter((message) => {
    const searchLower = searchTerm.toLowerCase();
    const subject = message.subject?.toLowerCase() || '';
    const senderName = `${message.sender?.firstName} ${message.sender?.lastName}`.toLowerCase();
    
    return subject.includes(searchLower) || senderName.includes(searchLower);
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'urgent':
        return 'text-red-800 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Send and receive messages</p>
        </div>
        <Button
          onClick={() => setShowComposeModal(true)}
          icon={FiSend}
        >
          Compose Message
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'inbox'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiInbox className="mr-2" />
                Inbox
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiMail className="mr-2" />
                Sent
              </div>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'archived'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiArchive className="mr-2" />
                Archived
              </div>
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <FiMail className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-600 text-lg">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                onClick={() => handleViewMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                  !message.isRead && activeTab === 'inbox' ? 'bg-blue-50' : ''
                } ${
                  message.priority === 'urgent'
                    ? 'border-red-500'
                    : message.priority === 'high'
                    ? 'border-orange-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!message.isRead && activeTab === 'inbox' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <p className={`text-sm ${!message.isRead && activeTab === 'inbox' ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                        {activeTab === 'sent' 
                          ? `To: ${message.recipient?.firstName} ${message.recipient?.lastName}`
                          : `${message.sender?.firstName} ${message.sender?.lastName}`
                        }
                      </p>
                      {message.priority && message.priority !== 'normal' && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          message.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : message.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-1 truncate ${!message.isRead && activeTab === 'inbox' ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                      {message.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {message.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={resetForm}
        title="Compose Message"
        size="lg"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient *
            </label>
            <select
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select recipient</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength="3"
              maxLength="200"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength="2000"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length} / 2000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" icon={FiSend}>
              Send Message
            </Button>
          </div>
        </form>
      </Modal>

      {/* Message Details Modal */}
      {selectedMessage && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMessage(null);
          }}
          title={selectedMessage.subject}
          size="lg"
        >
          <div className="space-y-4">
            {/* Priority Badge */}
            {selectedMessage.priority && selectedMessage.priority !== 'normal' && (
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMessage.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                    : selectedMessage.priority === 'high'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedMessage.priority === 'urgent' && '🚨 '}
                  {selectedMessage.priority === 'high' && '⚠️ '}
                  {selectedMessage.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            )}

            {/* Sender/Recipients */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {activeTab === 'sent' ? 'To' : 'From'}
              </h4>
              <p className="text-gray-600">
                {activeTab === 'sent' 
                  ? `${selectedMessage.recipient?.firstName} ${selectedMessage.recipient?.lastName}`
                  : `${selectedMessage.sender?.firstName} ${selectedMessage.sender?.lastName}`
                }
              </p>
            </div>

            {/* Date */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Date</h4>
              <p className="text-gray-600">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Message Body */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {activeTab === 'inbox' && (
                <Button
                  variant="secondary"
                  onClick={() => handleArchive(selectedMessage._id)}
                  icon={FiArchive}
                >
                  Archive
                </Button>
              )}
              {activeTab === 'archived' && (
                <Button
                  variant="secondary"
                  onClick={() => handleUnarchive(selectedMessage._id)}
                >
                  Restore
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedMessage._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default MessageList;
