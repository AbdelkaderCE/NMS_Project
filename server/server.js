import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Connect to Database
connectDB();

// ==================== SOCKET.IO SETUP ====================

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Store online users: { userId: socketId }
const onlineUsers = new Map();

console.log('🔌 Socket.IO server initialized on port 5000');

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    console.log('🔐 Socket auth attempt:', {
      hasAuth: !!socket.handshake.auth,
      hasToken: !!socket.handshake.auth?.token,
      userId: socket.handshake.auth?.userId,
    });
    
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ Socket auth failed: No token provided');
      return next(new Error('Authentication error: No token'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    
    console.log(`✅ Socket authenticated: ${socket.userId} (${socket.userRole})`);
    next();
  } catch (error) {
    console.log('❌ Socket auth failed:', error.message);
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId}`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);
  
  // Broadcast online users
  io.emit('online-users', Array.from(onlineUsers.keys()));
  
  // Join user to their personal room
  socket.join(`user:${socket.userId}`);
  
  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const { recipientId, subject, content, priority } = data;
      
      // Emit to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(`user:${recipientId}`).emit('new-message', {
          senderId: socket.userId,
          subject,
          content,
          priority,
          timestamp: new Date(),
        });
      }
      
      // Emit confirmation to sender
      socket.emit('message-sent', { success: true });
    } catch (error) {
      socket.emit('message-error', { error: error.message });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (recipientId) => {
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(`user:${recipientId}`).emit('user-typing', socket.userId);
    }
  });
  
  // Handle stop typing
  socket.on('stop-typing', (recipientId) => {
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(`user:${recipientId}`).emit('user-stop-typing', socket.userId);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

// Make io accessible to routes
app.set('io', io);

// ==================== MIDDLEWARE ====================

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Audit Logging Middleware (must be before routes)
import { auditMiddleware } from './utils/auditLogger.js';
app.use(auditMiddleware);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // Increased to 1000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development',
});

app.use('/api/', limiter);

// Request Logging (Development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROUTES ====================

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Nursery Management API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
import authRoutes from './routes/authRoutes.js';
import childrenRoutes from './routes/childrenRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import classRoutes from './routes/classRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import enrollmentRequestRoutes from './routes/enrollmentRequestRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import cron from 'node-cron';
import Payment from './models/Payment.js';
import { PAYMENT_STATUS } from './utils/constants.js';
import { sendOverduePaymentReminder } from './utils/emailService.js';

app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/enrollment-requests', enrollmentRequestRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/search', searchRoutes);

// ================= Overdue Payment Reminder Cron =================
// Runs daily at 08:00 server time
cron.schedule('0 8 * * *', async () => {
  try {
    const now = new Date();
    now.setHours(0,0,0,0);
    const overdue = await Payment.find({
      status: PAYMENT_STATUS.PENDING,
      dueDate: { $lt: now },
      reminderSent: false,
    }).populate('parent', 'email firstName lastName');
    for (const payment of overdue) {
      await sendOverduePaymentReminder(payment);
      payment.reminderSent = true;
      payment.reminderDate = new Date();
      await payment.save();
    }
    if (overdue.length) {
      console.log(`[Cron] Sent ${overdue.length} overdue payment reminder(s).`);
    }
  } catch (e) {
    console.error('[Cron] Overdue reminder job failed:', e.message);
  }
});

// ==================== ERROR HANDLING ====================

// 404 Handler (must be after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(errorHandler);

// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🏫 Nursery Management System API               ║
║                                                   ║
║   📡 Server running on port: ${PORT}                ║
║   🌍 Environment: ${process.env.NODE_ENV?.padEnd(11) || 'development'}              ║
║   🔗 URL: http://localhost:${PORT}                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
