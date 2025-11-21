import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      console.log('🔌 Attempting to connect socket...', { userId: user._id, hasToken: !!token });
      
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        path: '/socket.io',
        auth: {
          token: token,
          userId: user._id,
          userRole: user.role,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected', newSocket.id);
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        setConnected(false);
      });

      newSocket.on('online-users', (users) => {
        console.log('👥 Online users updated:', users);
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Closing socket connection');
        newSocket.close();
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [user, token]); // Removed socket from dependencies

  const sendMessage = (recipientId, subject, content, priority = 'normal') => {
    if (socket && connected) {
      socket.emit('send-message', {
        recipientId,
        subject,
        content,
        priority,
      });
    }
  };

  const emitTyping = (recipientId) => {
    if (socket && connected) {
      socket.emit('typing', recipientId);
    }
  };

  const emitStopTyping = (recipientId) => {
    if (socket && connected) {
      socket.emit('stop-typing', recipientId);
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    sendMessage,
    emitTyping,
    emitStopTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
