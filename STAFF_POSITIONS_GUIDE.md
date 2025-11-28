# 👥 Staff Positions & Permissions Guide
**Nursery Management System - Complete Access Control**

---

## 🎯 5 Staff Positions Overview

1. **Teacher** - Direct child education and attendance
2. **Assistant** - Support teachers, backup coverage
3. **Manager** - Operational management and enrollment
4. **Nurse** - Health, medical records, medications
5. **Receptionist** - Customer service, inquiries, front desk

---

## 📊 Complete Permissions Matrix

| Page/Feature | Admin | Manager | Teacher | Assistant | Nurse | Receptionist |
|--------------|-------|---------|---------|-----------|-------|--------------|
| **Dashboard** | ✅ Full | ✅ Staff | ✅ Staff | ✅ Staff | ✅ Staff | ✅ Staff |
| **Children List** | ✅ All | ✅ All | ✅ Own Groups | ✅ Own Groups | ✅ All | ❌ |
| **Child Profile** | ✅ Edit | ✅ Edit | ✅ View | ✅ View | ✅ Edit Medical | ❌ |
| **Parents List** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ View Only |
| **Staff List** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Classes** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Groups** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Attendance** | ✅ View/Edit | ✅ View/Edit | ✅ Mark/Edit | ✅ Mark/Edit | ❌ | ❌ |
| **Payments** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Activities** | ✅ | ✅ | ✅ Log | ✅ Log | ❌ | ❌ |
| **Calendar** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Messages** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Chat** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Enrollment Requests** | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ Screen Only |
| **Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **My Profile** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 👨‍🏫 1. TEACHER

### Access Level: **Medium - Classroom Operations**

### **Sidebar Menu:**
```
✅ Dashboard
✅ Children (filtered to their groups)
✅ Attendance (can mark)
✅ Activities (can log)
✅ Calendar
✅ Messages
✅ Chat
✅ My Profile
```

### **What Teachers Can Do:**

#### ✅ Children Management
- **View** children in their assigned groups only
- **Access** full child profiles (personal info, medical records, emergency contacts)
- **Cannot** add/edit/delete children
- **Filter:** Only see children in groups where they're assigned as instructor

#### ✅ Attendance (EXCLUSIVE)
- **Mark attendance** (check-in/check-out) - ONLY teachers and assistants can do this
- **Edit today's attendance** for their groups
- **View attendance history** for their groups
- **Generate attendance reports** for their groups

#### ✅ Activities
- **Log activities** for children in their groups (meals, naps, learning, play)
- **Upload photos** to activity logs
- **Create incident reports** (minor injuries, behavioral notes)
- **View calendar** of all activities

#### ✅ Communication
- **Send messages** to parents of their students
- **Send messages** to other staff (teachers, manager, admin)
- **Real-time chat** with staff and parents
- **Cannot** broadcast to all parents (only manager/admin)

#### ❌ What Teachers CANNOT Do:
- Accept/reject enrollment requests
- Add/edit/delete children
- Manage classes or groups
- View/manage payments
- View staff salaries
- Access audit logs
- Edit other teachers' activities
- View children outside their groups

---

## 👩‍🏫 2. ASSISTANT (Assistant Teacher)

### Access Level: **Medium-Low - Support Role**

### **Sidebar Menu:**
```
✅ Dashboard
✅ Children (filtered to their groups)
✅ Attendance (can mark when covering)
✅ Activities (can log basic)
✅ Calendar
✅ Messages
✅ Chat
✅ My Profile
```

### **What Assistants Can Do:**

#### ✅ Children Management (Limited)
- **View** children in their assigned groups (read-only)
- **Access** basic child profiles (cannot edit)
- **View** emergency contacts for safety
- **Cannot** edit any child information

#### ✅ Attendance (Backup)
- **Mark attendance** when covering for absent teacher
- **View attendance** for their groups (read-only)
- **Cannot** edit historical attendance

#### ✅ Activities (Basic)
- **Log simple activities** with supervisor approval
- **Add notes** to existing activity logs
- **View calendar** of activities
- **Cannot** create incident reports (must escalate to teacher)

#### ✅ Communication
- **Send messages** to teachers and manager (for questions/updates)
- **Real-time chat** with staff
- **Cannot** message parents directly (must go through teacher)

#### ❌ What Assistants CANNOT Do:
- All the same restrictions as teachers, PLUS:
- Cannot message parents directly
- Cannot create incident reports independently
- Limited activity logging (basic only)

---

## 👔 3. MANAGER

### Access Level: **High - Operations Management**

### **Sidebar Menu:**
```
✅ Dashboard
✅ Children (all)
✅ Parents
✅ Classes
✅ Groups
✅ Payments
✅ Activities
✅ Calendar
✅ Messages
✅ Chat
✅ Enrollment Requests
✅ My Profile
```

### **What Managers Can Do:**

#### ✅ Enrollment Management (Shared with Admin)
- **Accept/Reject** enrollment requests
- **View all** enrollment applications
- **Contact** prospective parents
- **Assign** children to classes/groups after enrollment

#### ✅ Children Management
- **Add/Edit/Delete** children
- **View all** children (not filtered by groups)
- **Access** full profiles, medical records
- **Assign** children to classes/groups
- **Manage** emergency contacts

#### ✅ Class & Group Management
- **Create/Edit/Delete** classes
- **Create/Edit/Delete** groups
- **Assign** teachers to groups (teachers only, not other positions)
- **Set** capacity limits

#### ✅ Payment Management
- **View all** invoices and payments
- **Create** invoices for parents
- **Record** payments received
- **View** payment statistics
- **Cannot** delete payments or issue refunds (admin only)

#### ✅ Attendance (View/Edit Only)
- **View** all attendance records
- **Edit** attendance if errors found
- **Generate** attendance reports
- **Cannot** mark daily attendance (that's teacher/assistant only)

#### ✅ Activities
- **Create** activities and events
- **Edit/Delete** activities
- **View** all activity logs
- **Schedule** field trips, special events

#### ✅ Communication
- **Message** any parent or staff
- **Broadcast** messages to all parents
- **Real-time chat** with everyone
- **Send** announcements

#### ❌ What Managers CANNOT Do (Admin Only):
- View/edit staff salaries
- View audit logs
- Terminate staff employment
- Delete staff members
- Access system settings
- Delete payments or issue refunds
- View financial analytics charts

---

## 🧑‍⚕️ 4. NURSE

### Access Level: **Specialized - Medical Only**

### **Sidebar Menu:**
```
✅ Dashboard
✅ Children (all - medical focus)
✅ Calendar
✅ Messages
✅ Chat
✅ My Profile
```

### **What Nurses Can Do:**

#### ✅ Children - Medical Records (EXCLUSIVE)
- **View ALL children** (need medical access for emergencies)
- **Edit medical information:**
  - Allergies (add/edit/remove)
  - Medications (add/edit/remove)
  - Medical conditions
  - Blood type
  - Immunization records
  - Doctor information
- **View** emergency contacts (for medical emergencies)
- **Cannot** edit non-medical information (name, address, etc.)

#### ✅ Health Monitoring
- **Log medication administration** (time, dosage, notes)
- **Create health incident reports** (injuries, illness, fever)
- **Track** daily health screenings (temperature checks)
- **Monitor** children with chronic conditions
- **Alert** parents of health issues

#### ✅ Medical Alerts
- **View** allergy alerts before meal times
- **Check** medication schedules
- **Track** immunization expiration dates
- **Send** health notifications to parents

#### ✅ Attendance (View Only)
- **View** attendance to identify sick children
- **Track** absences due to illness
- **Cannot** mark attendance

#### ✅ Communication
- **Send** health-related messages to parents
- **Alert** staff of contagious illnesses
- **Real-time chat** for urgent medical situations
- **Cannot** send general non-medical messages

#### ❌ What Nurses CANNOT Do:
- Mark regular attendance
- View financial information
- Edit non-medical child information
- Accept enrollment requests
- Manage classes/groups
- Create general activities (only health-related)
- View staff salaries
- Access audit logs

---

## 📞 5. RECEPTIONIST

### Access Level: **Low - Customer Service & Front Desk**

### **Sidebar Menu:**
```
✅ Dashboard
✅ Parents (view/contact only)
✅ Calendar
✅ Messages
✅ Chat
✅ Enrollment Requests (screen only)
✅ My Profile
```

### **What Receptionists Can Do:**

#### ✅ Enrollment Screening
- **View** enrollment requests (read-only)
- **Screen** initial applications (check completeness)
- **Create** enrollment requests from phone/walk-in inquiries
- **Contact** prospective parents for initial information
- **Cannot** accept or reject applications (only manager/admin)

#### ✅ Parent Communication
- **View** parent directory (names, phone, email)
- **Send** general announcements and reminders
- **Answer** parent inquiries about:
  - Payment status (view only, no amounts)
  - Child attendance ("Is my child here?")
  - School hours and policies
  - Upcoming events
- **Real-time chat** with parents and staff

#### ✅ Front Desk Operations
- **Log** visitor entries (parents, vendors, inspectors)
- **Answer** phone calls
- **Transfer** calls to appropriate staff
- **Schedule** tours for prospective parents
- **Distribute** notices and forms

#### ✅ Calendar
- **View** all events and activities
- **Create** general announcements (non-operational)
- **Check** room availability

#### ❌ What Receptionists CANNOT Do:
- View children's personal information
- View medical records
- Mark attendance
- Accept/reject enrollment requests
- View detailed payment amounts
- Edit children profiles
- Manage classes/groups
- Create operational activities
- Access staff information
- View audit logs

---

## 🔑 Special Access Notes

### **Medical Records Access:**
| Position | View Medical | Edit Medical |
|----------|--------------|--------------|
| Admin | ✅ All | ✅ All |
| Manager | ✅ All | ✅ All |
| Teacher | ✅ Own Groups | ❌ |
| Assistant | ✅ Own Groups | ❌ |
| Nurse | ✅ All | ✅ Medical Only |
| Receptionist | ❌ | ❌ |

### **Attendance Marking:**
- **ONLY** Teachers and Assistants can mark daily attendance
- Admin/Manager can view and edit (for corrections) but cannot mark
- Nurse can view (for health tracking)
- Receptionist cannot access attendance page

### **Enrollment Decisions:**
- **ONLY** Admin and Manager can accept/reject enrollment
- Receptionist can screen and create applications
- All other positions cannot access

### **Financial Information:**
- **ONLY** Admin and Manager see payment amounts
- Receptionist can see payment status (paid/unpaid) but not amounts
- All other positions have no access

---

## 🚀 Implementation Status

### ✅ Already Implemented:
- [x] Teacher position with attendance marking
- [x] Manager position with enrollment access
- [x] Position-based sidebar filtering
- [x] Teacher middleware for attendance routes
- [x] Manager middleware for enrollment routes
- [x] Position returned in auth response

### 📋 Needs Implementation:
- [ ] Assistant position - attendance backup access
- [ ] Nurse position - medical records exclusive access
- [ ] Receptionist position - enrollment screening access
- [ ] Position-based children filtering (teachers see only their groups)
- [ ] Medical records edit restriction (nurse only)
- [ ] Parent directory view for receptionist
- [ ] Enrollment screening workflow for receptionist

---

## 📝 Quick Reference

### **Access Hierarchy:**
```
Admin > Manager > [Teacher = Nurse] > Assistant > Receptionist
```

### **Attendance Marking:**
```
Teacher ✅ | Assistant ✅ | Others ❌
```

### **Enrollment Decisions:**
```
Admin ✅ | Manager ✅ | Receptionist (screen) | Others ❌
```

### **Medical Records Edit:**
```
Admin ✅ | Nurse ✅ | Others ❌
```

### **Payment Management:**
```
Admin ✅ | Manager ✅ | Others ❌
```

### **Children Visibility:**
```
Admin: All
Manager: All
Teacher: Own Groups
Assistant: Own Groups
Nurse: All (medical focus)
Receptionist: None
```

---

## 🔧 Database Migration Needed

If you have existing staff with old positions (cook, cleaner, etc.), run this:

```javascript
// Migration script
db.staff.updateMany(
  { position: 'cook' },
  { $set: { position: 'receptionist' } }
);

db.staff.updateMany(
  { position: { $in: ['cleaner', 'maintenance', 'security'] } },
  { $set: { position: 'assistant' } }
);
```

---

**Last Updated:** November 28, 2025  
**Status:** 5 Positions Defined, Implementation In Progress
