import express from 'express';
import {
  sendMessage,
  getInbox,
  getSentMessages,
  getArchivedMessages,
  getMessageById,
  markAsRead,
  markAsUnread,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
  getUnreadCount,
  getMessageStats,
  getConversation,
  markAllAsRead,
} from '../controllers/messageController.js';
import {
  sendMessageValidation,
  messageQueryValidation,
  messageIdValidation,
  userIdValidation,
} from '../validators/messageValidators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Message statistics
router.get('/stats', getMessageStats);

// Unread count
router.get('/unread/count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Inbox, sent, and archived
router.get(
  '/inbox',
  messageQueryValidation,
  validate,
  getInbox
);

router.get('/sent', getSentMessages);

router.get('/archived', getArchivedMessages);

// Conversation with a user
router.get(
  '/conversation/:userId',
  userIdValidation,
  validate,
  getConversation
);

// Message actions
router.put(
  '/:id/read',
  messageIdValidation,
  validate,
  markAsRead
);

router.put(
  '/:id/unread',
  messageIdValidation,
  validate,
  markAsUnread
);

router.put(
  '/:id/archive',
  messageIdValidation,
  validate,
  archiveMessage
);

router.put(
  '/:id/unarchive',
  messageIdValidation,
  validate,
  unarchiveMessage
);

// CRUD operations
router
  .route('/')
  .get(getInbox) // Add GET all messages
  .post(
    sendMessageValidation,
    validate,
    sendMessage
  );

router
  .route('/:id')
  .get(
    messageIdValidation,
    validate,
    getMessageById
  )
  .delete(
    messageIdValidation,
    validate,
    deleteMessage
  );

export default router;
