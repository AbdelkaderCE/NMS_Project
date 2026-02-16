# 🎓 Absence Excuse System - Testing Guide

> **Task 2 Implementation Complete** - Ready for end-to-end testing

---

## 🎯 What Was Built

### Backend (All Complete ✅)
- ✅ **Model**: AbsenceExcuse with full status workflow
- ✅ **Controller**: 6 endpoints with authorization
- ✅ **Routes**: All endpoints integrated into API
- ✅ **Database**: Cleaned and ready with test data

### Frontend (All Complete ✅)
- ✅ **Parent Component**: AbsenceExcuseSubmission.jsx (650 lines)
- ✅ **Teacher Component**: AbsenceExcuseReview.jsx (850 lines)
- ✅ **Styling**: Glassmorphic design with animations

---

## 🔑 Test Accounts for Absence Excuse System

### Parent Account (HAS 4 CHILDREN) ⭐⭐⭐
```
Email: parent@school.dev
Password: Parent@2025

Children Available to Submit Excuses:
1. Youssef Rashid
2. Leila Khalil
3. Muhammad Nassar
4. Dina Mohammad
```

### Teacher Account (CLASS AUTHORITY)
```
Email: staff1.user@school.dev
Password: Staffteacher@2025

Authority: Can review excuses for children in their classes
(All children are in Teacher's assigned classes)
```

### Admin Account (FULL ACCESS)
```
Email: admin@school.dev
Password: Admin@2025

Authority: Can view/manage all excuses system-wide
```

---

## 🧪 Testing Scenarios

### Scenario 1: Parent Submits Absence Excuse

**Steps:**
1. Login as: `parent@school.dev` / `Parent@2025`
2. Navigate to: Absence Excuse Submission
3. **Select Child**: Choose any of the 4 children
4. **Select Date**: Pick a date within 7 days
5. **Reason**: Enter reason (e.g., "Medical appointment", "Family emergency")
6. **Optional**: Attach file (medical certificate, letter, etc.)
7. **Submit**: Click "Submit Excuse"

**Expected Results:**
- ✅ Excuse created with status: "pending"
- ✅ Notifications sent to all teachers of that child's class
- ✅ Excuse appears in "My Submitted Excuses" list
- ✅ Success message shown

**Test Variations:**
- Submit for different children
- Submit with different reasons
- Submit with/without attachments
- Submit for past dates (should work)
- Submit >7 days in future (should fail)
- Submit duplicate for same child/date (should fail)

---

### Scenario 2: Parent Views Submitted Excuses

**Steps:**
1. Login as: `parent@school.dev` / `Parent@2025`
2. Navigate to: Absence Excuse Submission
3. **Scroll down**: View "My Submitted Excuses" section

**Expected Results:**
- ✅ All submitted excuses listed
- ✅ Status badges show: pending/approved/rejected
- ✅ Child name and date displayed
- ✅ Reason visible
- ✅ If approved: Review notes and teacher name shown
- ✅ If pending: Delete button available

**Verify:**
- Each excuse shows complete information
- Attachments are linked (if any)
- Status colors are correct (yellow/green/red)

---

### Scenario 3: Teacher Reviews Pending Excuses

**Steps:**
1. Login as: `staff1.user@school.dev` / `Staffteacher@2025`
2. Navigate to: Absence Excuse Review
3. **Default Filter**: Status = "Pending"
4. **View Cards**: Pending excuses displayed

**Expected Results:**
- ✅ Only pending excuses shown
- ✅ Child name and class name displayed
- ✅ Absence date shown
- ✅ Parent name (submitted by) shown
- ✅ Full reason displayed
- ✅ Attachments linked
- ✅ Count badge shows total

---

### Scenario 4: Teacher Approves Excuse

**Steps:**
1. Login as: `staff1.user@school.dev` / `Staffteacher@2025`
2. Navigate to: Absence Excuse Review
3. **On Pending Excuse Card**: Click "✓ Approve"
4. **Modal Opens**: 
   - Shows child name, date, reason
   - Textarea for review notes
5. **Enter Review Notes**: Type approval message (optional)
6. **Click**: "Confirm Approval"

**Expected Results:**
- ✅ Excuse status changes to: "approved"
- ✅ Green badge appears
- ✅ Card moves out of pending view
- ✅ Notification sent to parent
- ✅ Success message: "Excuse approved successfully! Parent has been notified."

**Test Variations:**
- Approve with review notes
- Approve without notes
- Refresh page → status persists
- Check parent dashboard → shows approved status

---

### Scenario 5: Teacher Rejects Excuse

**Steps:**
1. Login as: `staff1.user@school.dev` / `Staffteacher@2025`
2. Navigate to: Absence Excuse Review
3. **On Pending Excuse Card**: Click "✗ Reject"
4. **Modal Opens**: 
   - Shows reason for rejection form
5. **Enter Review Notes**: Type rejection reason (required)
6. **Click**: "Confirm Rejection"

**Expected Results:**
- ✅ Excuse status changes to: "rejected"
- ✅ Red badge appears
- ✅ Review notes saved
- ✅ Notification sent to parent
- ✅ Success message shown

**Validation:**
- Review notes required (cannot reject without reason)
- Parent receives notification with rejection reason

---

### Scenario 6: Parent Deletes Pending Excuse

**Steps:**
1. Login as: `parent@school.dev` / `Parent@2025`
2. Navigate to: Absence Excuse Submission
3. **In My Submitted Excuses**: Find pending excuse
4. **Click**: Delete button
5. **Confirm**: "Are you sure?"
6. **Confirm again**: Click Yes

**Expected Results:**
- ✅ Excuse removed from list
- ✅ Success message: "Excuse deleted successfully"
- ✅ Cannot delete approved/rejected excuses

---

### Scenario 7: Filter Excuses (Teacher View)

**Steps:**
1. Login as: `staff1.user@school.dev` / `Staffteacher@2025`
2. Navigate to: Absence Excuse Review
3. **Try Different Filters**:
   - Status: Pending (default)
   - Status: Approved
   - Status: Rejected
   - Status: All
   - Date Range: Select start and end dates

**Expected Results:**
- ✅ Results filter correctly
- ✅ Count badge updates
- ✅ Empty state when no matches
- ✅ Combination of filters works

---

### Scenario 8: Authorization Testing

**Test:** Ensure proper access control

**Steps:**
1. As **Parent**: Can only see own children's excuses ✅
2. As **Teacher**: Can only see children in assigned classes ✅
3. As **Admin**: Can see all excuses ✅
4. Try direct API access with wrong role (should deny) ✅

**Verify:**
- No cross-parent access
- No cross-teacher access
- Proper 403 Forbidden responses

---

## 📱 API Endpoints Testing

### Available Endpoints

#### 1. Submit Absence Excuse
```
POST /api/absence-excuses
Headers: Authorization: Bearer {token}
Body: {
  childId: "{childObjectId}",
  absenceDate: "2025-12-10",
  reason: "Medical appointment",
  attachment: {file} // optional
}
Response: 201 Created
```

#### 2. Get All Excuses (Role-filtered)
```
GET /api/absence-excuses?status=pending&startDate=2025-12-01&endDate=2025-12-31
Headers: Authorization: Bearer {token}
Response: 200 OK - Array of excuses
```

#### 3. Get Pending Excuses (For Teachers)
```
GET /api/absence-excuses/pending
Headers: Authorization: Bearer {token}
Response: 200 OK - Pending excuses for teacher's classes
```

#### 4. Get Single Excuse
```
GET /api/absence-excuses/{id}
Headers: Authorization: Bearer {token}
Response: 200 OK or 403 Forbidden
```

#### 5. Review Excuse (Approve/Reject)
```
PUT /api/absence-excuses/{id}/review
Headers: Authorization: Bearer {token}
Body: {
  action: "approve" or "reject",
  reviewNotes: "Your notes here"
}
Response: 200 OK
```

#### 6. Delete Excuse (Parents only)
```
DELETE /api/absence-excuses/{id}
Headers: Authorization: Bearer {token}
Response: 200 OK or 403 Forbidden (if not pending)
```

---

## ✅ Validation Rules to Test

### Date Validation
- ✅ Cannot submit for >7 days in future
- ✅ Can submit for today or past dates
- ✅ Date picker shows 7-day limit

### Duplicate Prevention
- ✅ Cannot submit 2 excuses for same child on same date
- ✅ Error message: "Excuse already submitted for this date"

### Reason Validation
- ✅ Reason required (not empty)
- ✅ Max 500 characters
- ✅ Character counter shows: "x/500"

### Authorization
- ✅ Only child's parent can submit for that child
- ✅ Only teacher of child's class can review
- ✅ Admins can manage all
- ✅ Cannot delete approved/rejected excuses

### File Upload
- ✅ Accepts: PDF, JPG, PNG, DOC, DOCX
- ✅ Optional field
- ✅ File link opens in new tab

---

## 🎨 UI/UX Verification

### Parent Submission Form
- ✅ Glass card with blur effect
- ✅ Form fields properly styled
- ✅ Error messages in red
- ✅ Success messages in green
- ✅ Responsive on mobile
- ✅ Submit button disabled while loading
- ✅ Reason character counter
- ✅ File input with help text

### Excuse List
- ✅ Cards display all required info
- ✅ Status badges colored correctly
- ✅ Hover effects on cards
- ✅ Review notes highlighted in blue
- ✅ Attachments show with 📎 icon
- ✅ Scrollable on long lists

### Teacher Review Dashboard
- ✅ Filter section with proper layout
- ✅ Grid layout responsive
- ✅ Excuse cards show all info
- ✅ Action buttons visible only for pending
- ✅ Modal opens correctly
- ✅ Overlay blocks background
- ✅ Close button works

---

## 🐛 Common Issues & Solutions

### Issue: Excuse not appearing after submit
**Solution**: Refresh page, check network tab in dev tools, verify token

### Issue: Cannot find child in dropdown
**Solution**: Verify parent account, child must be linked as parent

### Issue: Attachment not uploading
**Solution**: Check file type (PDF/JPG/PNG/DOC/DOCX), file size limits

### Issue: Notification not received
**Solution**: Check notification model, verify teacher exists for class

### Issue: Authorization denied (403)
**Solution**: Verify role has access, use correct account, check token expiry

---

## 📊 Test Data Available

After running `npm run setup:dev`:

```
16 Children total:
  - 4 children linked to parent@school.dev
  - 12 additional children (each with own parent)

All across 4 classes:
  - Nursery A
  - Nursery B
  - Pre-K
  - Kindergarten

128 existing attendance records:
  - Last 10 school days
  - Mix of all status types
  - Ready to test against
```

---

## 🚀 How to Start Testing

```bash
# 1. Start the server
cd server
npm run dev

# 2. Reset database (fresh start)
npm run setup:dev

# 3. Open browser
http://localhost:5173

# 4. Login as parent
Email: parent@school.dev
Password: Parent@2025

# 5. Navigate to Absence Excuse Submission
# 6. Follow testing scenarios above
```

---

## 📋 Testing Checklist

- [ ] Parent can submit excuse
- [ ] Validation works (7 day limit, 500 char reason)
- [ ] Duplicate prevention works
- [ ] Attachments can be uploaded
- [ ] Teacher can view pending excuses
- [ ] Teacher can approve excuse
- [ ] Teacher can reject excuse
- [ ] Parent receives notifications
- [ ] Status badges show correctly
- [ ] Filtering works (by status, date)
- [ ] Authorization is enforced
- [ ] Parent can delete pending only
- [ ] UI is responsive on mobile
- [ ] No console errors
- [ ] Accessibility is good

---

**Status:** ✅ Ready for Comprehensive Testing
**Last Updated:** December 5, 2025
