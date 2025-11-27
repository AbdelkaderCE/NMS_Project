# Universal Search Implementation

## Overview
A comprehensive search system inspired by macOS Spotlight that allows users to search across all entities **AND navigate to any page** in the NMS application with keyboard shortcuts, fuzzy matching, and real-time results.

## ✨ New Feature: Page Navigation

You can now search for pages/sections in the app! Just type keywords like:
- "**dash**" → Dashboard
- "**invoice**" or "**billing**" → Payments
- "**kids**" → Children Management  
- "**chat**" → Real-Time Chat
- "**teachers**" → Staff Management

Each page has smart keywords, so you don't need to remember exact names. The search automatically filters pages based on your role (admin/staff/parent).

## Features Implemented

### Backend (Complete)
- **Search Controller** (`server/controllers/searchController.js`)
  - Fuzzy matching algorithm with multi-level scoring:
    - Exact match: 1000 points
    - Starts with query: 500 points
    - Contains query: 100 points
    - Partial word match: 200 points
    - Character-by-character fuzzy: 10 points per match
  - Role-based access control:
    - **Admin**: Can search all 8 entity types (children, parents, staff, classes, groups, payments, activities, attendance)
    - **Staff**: Can search 7 entity types (excludes payments)
    - **Parent**: Can only search own children and payments
  - Query validation (minimum 2 characters)
  - Configurable result limits per category (default: 10)
  - Lean queries for performance
  - Result format includes: `_score`, `type`, `label`, `subtitle`, `route`

- **Search Routes** (`server/routes/searchRoutes.js`)
  - Single endpoint: `GET /api/search?q=query&limit=10`
  - Protected route (authentication required)
  - Integrated in `server.js`

### Frontend (Complete)
- **SearchModal Component** (`client/src/components/search/SearchModal.jsx`)
  - Real-time search with 300ms debounce
  - Categorized results display with icons
  - Keyboard navigation:
    - Arrow Up/Down to navigate results
    - Enter to select and navigate
    - Escape to close modal
  - Empty states and loading indicators
  - Result highlighting for exact matches
  - Keyboard hints in footer

- **Global Keyboard Shortcut**
  - Added in `App.tsx` with `useEffect` listener
  - Ctrl+K (Windows/Linux) or Cmd+K (Mac)
  - Opens SearchModal from anywhere in the app

- **Navbar Integration**
  - Search button with icon and keyboard shortcut hint
  - Responsive design (icon only on mobile)
  - Platform-specific shortcut display (⌘K for Mac, Ctrl+K for others)

- **Layout Integration**
  - All page components now accept `onSearchClick` prop
  - Layout component passes search handler to Navbar
  - Updated components:
    - Dashboard (all 3 role-specific dashboards)
    - ChildrenList, StaffList, ParentList
    - AttendanceList, PaymentList, ActivityList, ActivityCalendar
    - ClassList, GroupList, MessageList, ChatView
    - EnrollmentRequestList, AuditLogList

## Search Categories & Routes

### Pages (Navigation) 🆕
- **Label**: Page name (e.g., "Dashboard", "Children Management", "Payments")
- **Subtitle**: "Navigate to page"
- **Route**: Direct page route (e.g., `/dashboard`, `/children`, `/payments`)
- **Keywords**: Additional searchable terms (e.g., "home" for Dashboard, "invoices" for Payments)
- **Role-based**: Only shows pages the current user has access to
- **Examples**:
  - Search "dash" → Dashboard
  - Search "invoice" → Payments
  - Search "kids" → Children Management
  - Search "chat" → Real-Time Chat

### Children
- **Label**: `{firstName} {lastName}`
- **Subtitle**: Age & assigned class
- **Route**: `/children` (with future support for `/children/{id}`)

### Parents
- **Label**: `{firstName} {lastName}`
- **Subtitle**: Email address
- **Route**: `/parents` (with future support for `/parents/{id}`)

### Staff
- **Label**: `{firstName} {lastName}`
- **Subtitle**: Position
- **Route**: `/staff` (with future support for `/staff/{id}`)

### Classes
- **Label**: `{name}`
- **Subtitle**: Age range & capacity
- **Route**: `/classes` (with future support for `/classes/{id}`)

### Groups
- **Label**: `{name}`
- **Subtitle**: Schedule (day & time)
- **Route**: `/groups` (with future support for `/groups/{id}`)

### Payments
- **Label**: `Invoice #{invoiceNumber}`
- **Subtitle**: Amount & status
- **Route**: `/payments` (with future support for `/payments/{id}`)

### Activities
- **Label**: `{title}`
- **Subtitle**: Type & date
- **Route**: `/activities` (with future support for `/activities/{id}`)

### Attendance
- **Label**: Child name & date
- **Subtitle**: Check-in/out times
- **Route**: `/attendance` (with future support for `/attendance/{id}`)

## Usage

### For Users
1. **Open Search**:
   - Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
   - Or click the Search button in the navbar
2. **Type Query**: Enter at least 2 characters
3. **Navigate Results**: Use arrow keys to move through results
4. **Select**: Press Enter or click to navigate to the entity
5. **Close**: Press Escape or click outside the modal

### For Developers
**API Endpoint**:
```javascript
GET /api/search?q=john&limit=10
```

**Response Format**:
```json
{
  "query": "john",
  "totalResults": 15,
  "results": {
    "children": [
      {
        "_id": "...",
        "_score": 1000,
        "type": "children",
        "label": "John Doe",
        "subtitle": "Age 5 • Class: Butterflies",
        "route": "/children",
        "firstName": "John",
        "lastName": "Doe",
        ...
      }
    ],
    "parents": [...],
    "staff": [...]
  }
}
```

**Frontend Usage**:
```javascript
import { searchAPI } from '../../api';

const response = await searchAPI.search('query', 10);
const results = response.data.results;
```

## Performance Considerations
- Debounced input (300ms) to reduce API calls
- Lean Mongoose queries for faster database operations
- Limited results per category (default 10)
- In-memory scoring (post-fetch) to avoid complex queries
- Query-level filtering for role-based access (not post-fetch)

## Security
- Authentication required (protect middleware)
- Role-based result filtering at query level
- Parents can only search their own children/payments
- Query validation prevents empty/short searches
- **Pages filtered by user role** - Each role only sees pages they have access to

## Page Navigation Feature 🆕

The search now includes **quick navigation to any page** in the app! This makes it easy to jump to different sections without using the sidebar.

### Available Pages by Role

**Admin (14 pages):**
Dashboard, Children Management, Staff Management, Parents, Attendance, Payments, Activities, Activity Calendar, Classes, Groups, Messages, Real-Time Chat, Enrollment Requests, Audit Logs

**Staff (11 pages):**
Dashboard, Children Management, Parents, Attendance, Activities, Activity Calendar, Classes, Groups, Messages, Real-Time Chat, Enrollment Requests

**Parent (5 pages):**
Dashboard, Children Management, Payments, Messages, Real-Time Chat

### Smart Page Search with Keywords

Each page has multiple keywords for easier discovery:
- **Dashboard**: home, overview, summary
- **Children Management**: kids, students, child
- **Staff Management**: employees, teachers, workers
- **Payments**: invoices, billing, fees, tuition
- **Activities**: events, schedule, tasks
- **Attendance**: check-in, check-out, presence
- **Messages**: inbox, communication, notifications
- **Real-Time Chat**: messaging, live chat, conversation
- **And more...**

### Example Page Searches
```
Type "home" → Dashboard
Type "invoice" → Payments  
Type "kids" → Children Management
Type "chat" → Real-Time Chat
Type "billing" → Payments
Type "teachers" → Staff Management (admin only)
Type "tracking" → Audit Logs (admin only)
```

## Future Enhancements
1. **Entity Detail Routes**: Implement `/entity/{id}` routes for direct navigation
2. **Recent Searches**: Store and display recent search queries
3. **Search History**: Track user search patterns
4. **Advanced Filters**: Add date range, status, type filters
5. **Search Analytics**: Track popular searches and results
6. **Elasticsearch Integration**: For larger datasets and more complex queries
7. **Search Suggestions**: Auto-complete based on popular searches
8. **Custom Scoring**: Allow admins to configure scoring weights
9. **Export Results**: Download search results as CSV/PDF
10. **Saved Searches**: Allow users to save and reuse complex searches

## Files Modified/Created

### Backend
- ✅ Created: `server/controllers/searchController.js`
- ✅ Created: `server/routes/searchRoutes.js`
- ✅ Modified: `server/server.js` (registered search routes)

### Frontend
- ✅ Created: `client/src/components/search/SearchModal.jsx`
- ✅ Modified: `client/src/api/index.js` (added searchAPI)
- ✅ Modified: `client/src/App.tsx` (global keyboard shortcut + SearchModal)
- ✅ Modified: `client/src/components/layout/Navbar.jsx` (search button)
- ✅ Modified: `client/src/components/layout/Layout.jsx` (onSearchClick prop)
- ✅ Modified: All page components (13 files) to accept/pass onSearchClick
- ✅ Modified: All dashboard components (3 files) to accept/pass onSearchClick

## Testing
1. ✅ Backend server running on port 5000
2. ✅ Frontend server running on port 5174
3. ✅ No TypeScript/ESLint errors
4. ✅ Search routes registered successfully
5. ✅ SearchModal integrated into App

**Next Steps for Testing**:
1. Login as different user roles (admin, staff, parent)
2. Press Ctrl+K/Cmd+K to open search
3. Type queries and verify:
   - Fuzzy matching works (typos still return results)
   - Role-based filtering (parents see only their data)
   - Keyboard navigation (arrows + Enter)
   - Result categorization
   - Navigation to entity pages
4. Test edge cases:
   - Empty query
   - Query < 2 characters
   - No results found
   - Special characters in query

## Conclusion
The universal search feature is now fully implemented with both backend and frontend complete. Users can instantly search across all entities using a keyboard shortcut (Ctrl+K/Cmd+K), with fuzzy matching ensuring relevant results even with typos. The categorized results display makes it easy to scan and navigate to the desired entity. Role-based access control ensures security, with parents only able to search their own children and payments.
