# Profile System Documentation

## Overview
The profile system provides comprehensive views for all users in the NMS (Nursery Management System). It displays detailed information based on user type and role permissions with full edit capabilities.

## Implemented Features

### 1. Child Profile (`/children/:id`)
**Access:** Parents (own children), Admin (all), Staff (all)

**Components:**
- **Profile Header**
  - Profile photo or initials avatar
  - Full name, age, gender
  - Status badge (active/inactive/on-hold)
  - Quick stats cards (attendance rate, activities count, pending payments)
  
- **Personal Information Card**
  - Full name
  - Date of birth (formatted)
  - Gender
  - Enrollment date
  - Assigned class/group
  
- **Medical Information Card**
  - Blood type
  - Allergies (color-coded chips)
  - Medications (color-coded chips)
  - Medical conditions (color-coded chips)
  - Dietary restrictions (color-coded chips)
  
- **Parents/Guardians Card**
  - Parent name with relationship
  - Primary parent indicator
  - Contact information (email, phone)
  
- **Emergency Contacts Card**
  - Contact name and relationship
  - Phone and email
  
- **Quick Action Links**
  - View Attendance History → `/attendance?child={id}`
  - View Activities → `/activities?child={id}`
  - View Payments → `/payments?child={id}`

**Features:**
- Edit button (admin/staff only)
- Back navigation
- Responsive grid layout
- Real-time stats calculation
- Loading state with spinner

**API Endpoints Used:**
- `GET /children/:id` - Fetch child details
- `GET /attendance` - Fetch attendance records
- `GET /activities/child/:id` - Fetch child's activities
- `GET /payments/child/:id` - Fetch child's payments

## Navigation Integration

### From Parent Dashboard
- Child cards show "View Details" link
- Clicking navigates to `/children/:id`
- Shows all child information and stats

### From Children List (Admin/Staff)
- "View" or "Details" button on each row
- Navigates to `/children/:id`

## Styling
- Tailwind CSS for responsive design
- Color-coded elements:
  - Blue: Attendance
  - Purple: Activities
  - Yellow: Payments
  - Red: Allergies
  - Green: Dietary restrictions
- Gradient avatars for children without photos
- Hover effects on action cards

## Future Enhancements (Not Yet Implemented)

### Staff Profile (`/staff/:id`)
**Access:** Admin only

**Planned Components:**
- Employment information (position, department, hire date)
- Qualifications and certifications
- Work schedule
- Performance ratings
- Assigned classes/groups
- Activity log

### Parent/User Profile (`/profile/:id`)
**Access:** Self, Admin, Staff (limited)

**Planned Components:**
- Contact information
- Children list with quick links
- Payment summary and history
- Message statistics
- Enrollment requests history
- Account settings

## File Structure
```
client/src/pages/
├── children/
│   ├── ChildProfile.jsx       ✅ Implemented
│   ├── ChildEnrollmentForm.jsx ✅ Existing
│   └── ChildrenList.jsx        ✅ Existing
├── staff/
│   └── StaffProfile.jsx        ⏳ Planned
└── profile/
    └── UserProfile.jsx         ⏳ Planned
```

## Usage Example

### Parent viewing their child's profile:
```jsx
// Navigate from dashboard
<Link to={`/children/${child._id}`}>View Details</Link>

// Route in App.tsx
<Route path="/children/:id" element={
  <PrivateRoute>
    <ChildProfile onSearchClick={handleSearchClick} />
  </PrivateRoute>
} />
```

### Features in Action:
1. Parent clicks "View Details" on child card
2. Navigates to `/children/abc123`
3. Sees comprehensive profile with stats
4. Can click quick actions to view related data
5. Admin/Staff see additional "Edit Profile" button

## Benefits
- **Centralized Information:** All child data in one place
- **Role-Based Access:** Appropriate permissions for each user type
- **Quick Navigation:** Direct links to related pages
- **Real-Time Stats:** Dynamic calculation of attendance, activities, payments
- **Responsive Design:** Works on desktop, tablet, mobile
- **Professional UI:** Clean, modern interface with icons and color coding
