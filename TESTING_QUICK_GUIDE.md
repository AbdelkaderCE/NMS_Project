# Position System Quick Test Guide 🚀

## Testing the Position-Based Access Control System

### Prerequisites
✅ Migration script run successfully (Exit Code: 0)  
✅ Backend server restarted  
✅ Frontend refreshed (clear cache)

---

## Test Scenarios

### 🧪 Test 1: Teacher Login
**Credentials:** `teacher@nursery.com` / `teacher123`

**Expected Behavior:**
1. ✅ Sidebar shows: Dashboard, Children, Attendance, Groups, Classes, Calendar, Messages, Chat, Profile
2. ❌ Should NOT see: Enrollment Requests, Parents, Staff, Payments, Audit Logs
3. ✅ Children page: Only shows children in teacher's assigned groups
4. ✅ Attendance page: Can mark attendance for assigned groups only
5. ✅ Groups page: Only shows assigned groups

**Quick Verification:**
```javascript
// Check in DevTools Console after login
console.log(user.staffInfo.position); // Should be "teacher"
console.log(user.staffInfo.assignedClasses); // Should be array of group IDs
```

---

### 🧪 Test 2: Assistant Login
**Credentials:** Create a test assistant or update existing staff position to "assistant"

**Expected Behavior:**
1. ✅ Same access as Teacher
2. ✅ Can mark attendance
3. ✅ Only sees assigned groups' children
4. ❌ Should NOT see enrollment requests

---

### 🧪 Test 3: Manager Login
**Credentials:** `manager@nursery.com` / `manager123`

**Expected Behavior:**
1. ✅ Sidebar shows: Dashboard, Parents, Staff, Classes, Groups, Enrollment, Messages, Chat, Profile
2. ✅ Children page: Shows ALL children (no filtering)
3. ✅ Enrollment Requests page: Can approve/reject applications
4. ✅ Staff page: Can manage staff members
5. ❌ Should NOT see: Attendance (teachers only)

**Quick Verification:**
```javascript
// Check in DevTools Console
console.log(user.staffInfo.position); // Should be "manager"
```

**Test Enrollment Approval:**
1. Go to Enrollment Requests page
2. Click "View Details" on a pending request
3. ✅ Should see "Accept Application" and "Reject Application" buttons
4. ✅ Can click accept → Shows class assignment form
5. ✅ Can click reject → Shows rejection reason textarea

---

### 🧪 Test 4: Receptionist Login
**Credentials:** Create receptionist account (cook was migrated to receptionist)

**Expected Behavior:**
1. ✅ Sidebar shows: Parents, Enrollment, Payments, Messages, Chat, Profile
2. ✅ Children page: Shows ALL children (no filtering)
3. ✅ Enrollment Requests page: **VIEW ONLY**
   - ✅ Orange warning banner: "View-Only Access - Contact manager for approvals"
   - ✅ Can click "View Details" to see request
   - ❌ Should NOT see "Accept" or "Reject" buttons
   - ✅ See orange notice: "Contact a manager or administrator to process this request"
4. ❌ Should NOT see: Attendance, Dashboard, Staff, Audit Logs

**Quick Verification:**
```javascript
// In EnrollmentRequestList component
console.log(isReceptionist); // Should be true
```

---

### 🧪 Test 5: Nurse Login
**Credentials:** Create nurse account

**Expected Behavior:**
1. ✅ Sidebar shows: Children, Calendar, Messages, Chat, Profile
2. ✅ Children page: Shows ALL children (no filtering)
3. ✅ Can view medical records
4. ✅ (Future) Can edit medical records
5. ❌ Should NOT see: Attendance, Enrollment, Dashboard, Staff

---

### 🧪 Test 6: Admin Login
**Credentials:** `admin@nursery.com` / `admin123`

**Expected Behavior:**
1. ✅ **FULL ACCESS TO EVERYTHING**
2. ✅ All menu items visible
3. ✅ Can mark attendance (bypasses teacher check)
4. ✅ Can approve enrollment (bypasses manager check)
5. ✅ Can see all children (no filtering)
6. ✅ Can access audit logs

---

## API Testing (Backend)

### Test Children Filtering Endpoint
```bash
# Login as teacher and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@nursery.com","password":"teacher123"}'

# Use returned token to fetch children
curl -X GET http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
  
# Expected: Only children in teacher's assigned groups
# Check response.data array - should be filtered
```

### Test Enrollment Approval as Non-Manager
```bash
# Login as teacher
# Try to access enrollment endpoint - Should get 403
curl -X GET http://localhost:5000/api/enrollment-requests \
  -H "Authorization: Bearer TEACHER_TOKEN"
  
# Expected Response:
# { "success": false, "message": "Only managers can access enrollment requests" }
# Status: 403 Forbidden
```

### Test Attendance Marking as Non-Teacher
```bash
# Login as nurse
# Try to mark attendance - Should get 403
curl -X POST http://localhost:5000/api/attendance \
  -H "Authorization: Bearer NURSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"childId":"...","date":"2025-01-28","status":"present"}'
  
# Expected Response:
# { "success": false, "message": "Only teachers can mark attendance" }
# Status: 403 Forbidden
```

---

## Frontend Visual Checks

### Sidebar Menu Items by Position

| Menu Item | Teacher | Assistant | Manager | Nurse | Receptionist | Admin |
|-----------|---------|-----------|---------|-------|--------------|-------|
| Dashboard | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Children | ✅* | ✅* | ❌ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Parents | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Staff | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Enrollment | ❌ | ❌ | ✅ | ❌ | ✅** | ✅ |
| Payments | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Groups | ✅* | ✅* | ✅ | ❌ | ❌ | ✅ |
| Classes | ✅* | ✅* | ✅ | ❌ | ❌ | ✅ |
| Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Full Access
- ✅* = Limited to assigned groups only
- ✅** = View-only (cannot approve/reject)
- ❌ = No Access

---

## Common Issues & Fixes

### Issue: User doesn't have staffInfo
**Symptom:** `user.staffInfo` is undefined
**Fix:** 
1. Check backend auth middleware attaches staffInfo
2. Restart backend server
3. Clear browser cache and re-login
4. Check `/api/auth/me` response in Network tab

### Issue: Children list empty for teacher
**Symptom:** Teacher sees no children even though assigned to groups
**Fix:**
1. Check teacher's Staff record has `assignedClasses` array
2. Verify children have `assignedGroup` field set
3. Check MongoDB query in `childrenController.js`
4. Test with admin login to see all children

### Issue: Receptionist can still approve enrollment
**Symptom:** Approve/reject buttons visible for receptionist
**Fix:**
1. Check `isReceptionist` calculation in EnrollmentRequestList
2. Verify `user.staffInfo.position === 'receptionist'`
3. Check conditional rendering: `{!isReadOnly && <buttons />}`

### Issue: Position shows as undefined
**Symptom:** StaffInfo exists but position is undefined
**Fix:**
1. Run migration script again: `node server/migrateStaffPositions.js`
2. Check Staff model has valid position value
3. Update staff position manually in MongoDB if needed

---

## Quick Debugging Commands

### Check User Object in Browser Console
```javascript
// After login, check:
console.log(user);
console.log(user.role);
console.log(user.staffInfo);
console.log(user.staffInfo?.position);
console.log(user.staffInfo?.assignedClasses);
```

### Check Backend Logs
```bash
# In server terminal, you should see:
# "Staff info attached: { position: 'teacher', assignedClasses: [...] }"
```

### MongoDB Query to Check Positions
```javascript
// In MongoDB Compass or shell
db.staff.find({}, { firstName: 1, lastName: 1, position: 1, assignedClasses: 1 })
```

---

## Success Criteria

### ✅ System is Working Correctly When:
1. Teachers only see children in their assigned groups
2. Receptionist sees orange warning on enrollment page
3. Receptionist cannot see approve/reject buttons
4. Manager can approve/reject enrollment requests
5. Non-teachers get 403 when trying to mark attendance
6. Non-managers get 403 when accessing enrollment API
7. All staff have `staffInfo.position` in their user object
8. Sidebar menus match position permissions table above

### ❌ System Needs Fixing When:
1. Teacher sees all children (not filtered)
2. Receptionist can approve enrollment
3. Nurse can mark attendance
4. StaffInfo is missing from user object
5. Position shows as undefined or null
6. Wrong menu items showing for a position

---

## Next Steps After Testing

### If All Tests Pass ✅
- System is production-ready
- Deploy to staging environment
- Create user training documentation
- Monitor error logs for first week

### If Tests Fail ❌
- Check error logs in browser console
- Check backend terminal for middleware errors
- Verify migration script ran successfully
- Re-run specific test scenario
- Contact development team

---

**Last Updated:** 2025-01-28  
**Version:** 1.0.0  
**Status:** Ready for UAT (User Acceptance Testing)
