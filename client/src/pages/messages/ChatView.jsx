import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, contactsAPI } from '../../api';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';

const ChatView = ({ onSearchClick }) => {
  const { user } = useAuth();
  const { socket, connected, onlineUsers, emitTyping, emitStopTyping } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch all users for chat list
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug socket connection
  useEffect(() => {
    console.log('Socket status:', { socket: !!socket, connected, onlineUsers });
  }, [socket, connected, onlineUsers]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (data) => {
      // Add message to chat if it's from or to the selected user
      if (selectedUser && (data.senderId === selectedUser._id || data.recipientId === selectedUser._id)) {
        const newMsg = {
          sender: { _id: data.senderId },
          recipient: { _id: data.recipientId },
          message: data.content,
          priority: data.priority,
          createdAt: data.timestamp,
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    });

    socket.on('user-typing', (userId) => {
      if (selectedUser && userId === selectedUser._id) {
        setTypingUsers((prev) => new Set([...prev, userId]));
      }
    });

    socket.on('user-stop-typing', (userId) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch role-aware contacts for chat
      const response = await contactsAPI.getAll();
      const allUsers = response.data || [];
      // Filter out current user
      setUsers(allUsers.filter(u => u._id !== user._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversation(userId);
      setMessages(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
    fetchConversation(user._id);
  };

  const handleTyping = () => {
    if (!selectedUser) return;
    
    emitTyping(selectedUser._id);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedUser._id);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      // Send via API (which saves to database)
      const response = await messageAPI.create({
        recipient: selectedUser._id,
        subject: 'Chat Message',
        content: newMessage,
        priority: 'normal',
      });

      // Add to local messages immediately
      const newMsg = {
        _id: response.data._id,
        sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName, photo: user.photo },
        recipient: { _id: selectedUser._id },
        message: newMessage,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
      
      // Clear input
      setNewMessage('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping(selectedUser._id);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading && !selectedUser) {
    return <Loading />;
  }

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Chat</h1>
          <p className="text-gray-600 mt-1">
            {connected ? (
              <span className="text-green-600">● Connected</span>
            ) : (
              <span className="text-red-600">● Disconnected</span>
            )}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Users List */}
          <Card className="col-span-4 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4"><Loading /></div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No users available</p>
                </div>
              ) : (
                users.map((usr) => (
                  <div
                    key={usr._id}
                    onClick={() => handleSelectUser(usr)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedUser?._id === usr._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {usr.photo ? (
                          <img
                            src={usr.photo}
                            alt={usr.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                            {usr.firstName?.[0]}{usr.lastName?.[0]}
                          </div>
                        )}
                        {isUserOnline(usr._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {usr.firstName} {usr.lastName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">{usr.role}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-8 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="relative">
                    {selectedUser.photo ? (
                      <img
                        src={selectedUser.photo}
                        alt={selectedUser.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </div>
                    )}
                    {isUserOnline(selectedUser._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isUserOnline(selectedUser._id) ? '🟢 Online' : '⚫ Offline'}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {loading ? (
                    <Loading />
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.sender._id === user._id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            }`}
                          >
                            <div className="break-words">{msg.message}</div>
                            <div
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing Indicator */}
                  {typingUsers.has(selectedUser._id) && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={!connected}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || !connected}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Select a chat to start messaging</p>
                  <p className="text-sm mt-1">Choose a user from the left to begin</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChatView;
