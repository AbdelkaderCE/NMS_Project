# 🔔 Notification System Documentation

## Overview
The Nursery Management System now includes a comprehensive real-time notification system that keeps users informed about important events and activities.

## Features

### ✅ Core Functionality
- **Real-time notifications** via Socket.IO
- **Browser notifications** support
- **Unread count badge** in navbar
- **Mark as read/unread** functionality
- **Delete notifications** individually
- **Mark all as read** bulk action
- **Clear all read** notifications
- **Filtering** (all, unread, read)
- **Pagination** for large notification lists
- **Auto-navigation** when clicking notification link

### 🎨 Enhanced UI/UX
- **Modern dropdown design** with gradient header
- **Icon-based notification types** (emojis for visual clarity)
- **Priority indicators** (urgent, high, normal, low)
- **Color-coded badges** based on priority
- **Hover actions** for mark as read/delete
- **Smooth animations** and transitions
- **Responsive design** for mobile and desktop
- **Time ago** formatting (e.g., "5m ago", "2h ago")

## Notification Types

| Type | Icon | Description | Priority | Use Case |
|------|------|-------------|----------|----------|
| `message` | 💬 | New message received | Normal/Urgent | Messaging system |
| `payment` | 💰 | Payment-related updates | Normal | Payment received/overdue |
| `enrollment` | 📝 | Enrollment requests | High | New enrollment application |
| `attendance` | ✅ | Attendance updates | Normal/High | Attendance marked |
| `child_registration` | 👶 | Child registered | Normal | New child added |
| `staff_added` | 👔 | Staff member added | High | Staff onboarding |
| `activity_scheduled` | 🎯 | Activity scheduled | Normal | Activity created |
| `document_uploaded` | 📄 | Document uploaded | Low | Document added |
| `system` | ⚙️ | System messages | High | System announcements |

## Backend Implementation

### Models
- **Location**: `server/models/Notification.js`
- **Fields**:
  - `recipient`: User who receives notification
  - `sender`: User who triggered notification (optional)
  - `type`: Notification type (enum)
  - `title`: Notification title
  - `message`: Notification message
  - `read`: Read status (boolean)
  - `link`: URL to navigate to (optional)
  - `metadata`: Additional data (object)
  - `priority`: Priority level (enum)

### API Endpoints

#### Get Notifications
```
GET /api/notifications
Query params: page, limit, read (true/false)
Returns: { notifications, pagination, unreadCount }
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Returns: { unreadCount }
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Returns: { notification }
```

#### Mark All as Read
```
PUT /api/notifications/mark-all-read
Returns: { modifiedCount }
```

#### Delete Notification
```
DELETE /api/notifications/:id
Returns: Success message
```

#### Clear Read Notifications
```
DELETE /api/notifications/clear-read
Returns: { deletedCount }
```

### Helper Functions
**Location**: `server/utils/notificationHelper.js`

Available notification helpers:
- `notifyPaymentReceived(payment, io)` - Payment notifications
- `notifyEnrollmentRequest(enrollment, adminUsers, io)` - Enrollment notifications
- `notifyChildRegistered(child, parentUser, io)` - Child registration
- `notifyStaffAdded(staff, io)` - Staff onboarding
- `notifyActivityScheduled(activity, participants, io)` - Activity notifications
- `notifyAttendanceMarked(attendance, parentUser, io)` - Attendance updates
- `notifyNewMessage(message, recipientId, io)` - Message notifications
- `notifyDocumentUploaded(document, recipientId, io)` - Document uploads
- `notifySystemMessage(recipients, title, message, io)` - System-wide messages

### Usage Example
```javascript
import { notifyPaymentReceived } from '../utils/notificationHelper.js';

// In payment controller after payment is created
const io = req.app.get('io');
await notifyPaymentReceived(payment, io);
```

## Frontend Implementation

### Components

#### Navbar Notifications
**Location**: `client/src/components/layout/Navbar.jsx`

Features:
- Dropdown with notification list
- Unread count badge with animation
- Quick actions (mark all read, clear read)
- Real-time updates via Socket.IO
- Click to navigate functionality

#### Notifications Page
**Location**: `client/src/pages/notifications/NotificationsPage.jsx`

Features:
- Full-page notification list
- Filtering options (all, unread, read)
- Pagination support
- Bulk actions (mark all read, clear read)
- Individual notification actions
- Priority-based styling

### API Service
**Location**: `client/src/api/notificationAPI.js`

Provides methods for:
- `getNotifications(params)` - Fetch notifications
- `getUnreadCount()` - Get unread count
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete single notification
- `clearReadNotifications()` - Clear all read

### Socket Integration
**Location**: `client/src/context/SocketContext.jsx`

Added:
- `newNotification` state for real-time notifications
- Socket listener for 'new-notification' events
- Browser notification support

## Real-Time Flow

1. **Event Occurs** (e.g., payment received)
2. **Helper Function Called** with Socket.IO instance
3. **Notification Created** in database
4. **Socket Event Emitted** to recipient's room
5. **Frontend Receives** notification via socket
6. **UI Updates** immediately (badge, dropdown, page)
7. **Browser Notification** shown (if permission granted)

## Browser Notifications

The system requests browser notification permission and shows native notifications when:
- User is logged in
- New notification received via socket
- Browser permission is granted

## Styling & Themes

### Priority Colors
- **Urgent**: Red (red-600, red-50, red-200)
- **High**: Orange (orange-600, orange-50, orange-200)
- **Normal**: Blue (blue-600, blue-50, blue-200)
- **Low**: Gray (gray-600, gray-50, gray-200)

### Animations
- Badge pulse animation for unread count
- Unread indicator pulse animation
- Smooth transitions on hover
- Loading spinner for async operations

## Integration Points

### Where to Add Notifications

1. **Payment Received** → `paymentController.js` after payment creation
2. **Child Registered** → `childrenController.js` after child creation
3. **Staff Added** → `staffController.js` after staff creation
4. **Attendance Marked** → `attendanceController.js` after attendance creation
5. **Activity Scheduled** → `activityController.js` after activity creation
6. **Message Sent** → Already integrated in `messageController.js`
7. **Enrollment Request** → `enrollmentRequestController.js` after request creation

### Example Integration
```javascript
// In any controller
import { createNotification } from '../controllers/notificationController.js';

// Get Socket.IO instance
const io = req.app.get('io');

// Create notification
await createNotification({
  recipient: userId,
  type: 'payment',
  title: 'Payment Received',
  message: 'Your payment has been processed',
  link: '/payments',
  metadata: { paymentId: payment._id },
  priority: 'normal'
}, io);
```

## Testing

### Manual Testing Steps
1. **Real-time**: Login with two users, trigger notification, verify instant update
2. **Badge**: Check unread count updates correctly
3. **Mark as Read**: Click notification, verify it marks as read
4. **Delete**: Delete notification, verify it's removed
5. **Pagination**: Create 20+ notifications, test pagination
6. **Filtering**: Test all/unread/read filters
7. **Navigation**: Click notification with link, verify navigation
8. **Browser Notifications**: Grant permission, verify native notifications

### Test Accounts
Use accounts from `TEST_ACCOUNTS.md` to test different roles.

## Future Enhancements

- [ ] Email notifications for critical alerts
- [ ] SMS notifications integration
- [ ] Notification preferences per user
- [ ] Notification categories/channels
- [ ] Do Not Disturb mode
- [ ] Scheduled notifications
- [ ] Notification templates
- [ ] Rich notifications with images
- [ ] Action buttons in notifications
- [ ] Notification history/archive
- [ ] Export notifications as PDF/CSV

## Search Integration

The notifications page is searchable via universal search:
- Search term: "notifications", "alerts", "updates", "news"
- Available to all roles (admin, staff, parent)
- Icon: bell

## Routes

- **Navbar Dropdown**: Always visible (no route)
- **Full Page**: `/notifications`
- **API Base**: `/api/notifications`

## Performance Considerations

- Notifications are paginated (20 per page by default)
- Unread count is cached and updated incrementally
- Socket events only sent to specific user rooms
- Database indexes on recipient, read status, and timestamp
- Auto-cleanup of old read notifications can be added

## Security

- All endpoints protected with authentication middleware
- Users can only access their own notifications
- Socket authentication required
- Role-based notification types
- XSS protection in notification content

---

**Last Updated**: November 28, 2025
**Status**: ✅ Fully Implemented and Tested
