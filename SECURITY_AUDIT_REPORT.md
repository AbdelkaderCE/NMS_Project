# 🔒 Security Audit Report - NMS Position-Based Access Control
**Date:** November 28, 2025  
**Status:** Critical Issues Identified

---

## 🚨 CRITICAL SECURITY GAPS

### 1. **Parents Page - Missing Position-Based Backend Enforcement**
**Severity:** HIGH  
**Status:** ❌ VULNERABLE

#### Issue:
- `/parents` route in `App.tsx` only checks `allowedRoles: ['admin', 'staff']`
- **NO position check is enforced** - ANY staff can access (nurse, teacher, assistant, receptionist, manager)
- Backend `/auth/users?role=parent` endpoint has NO position-based middleware
- Nurse can still access parent page via direct URL navigation

#### Current Implementation:
```tsx
// App.tsx - Line ~104
<Route
  path="/parents"
  element={
    <PrivateRoute allowedRoles={['admin', 'staff']}>  // ❌ Too broad!
      <ParentList onSearchClick={handleSearchClick} />
    </PrivateRoute>
  }
/>
```

#### Backend Route:
```javascript
// authRoutes.js - No position enforcement
router.get('/users', getUsers);  // ❌ No position middleware
```

#### Impact:
- Nurse, teacher, assistant can all access `/parents` directly
- Universal search now filters correctly, but direct navigation bypasses this
- Staff with no business viewing parent info can see names, emails, phone numbers, addresses

---

### 2. **Universal Search - Partially Fixed**
**Severity:** MEDIUM  
**Status:** ✅ FIXED (Backend) | ⚠️ NEEDS FRONTEND VALIDATION

#### What Was Fixed:
- Backend search now filters pages by `role` AND `position`
- Parents page excluded from search results for non-manager/receptionist staff
- Children results filtered for teacher/assistant to only their assigned groups

#### What Still Needs Testing:
- Frontend SearchModal clicking on filtered results
- Verify nurse cannot see "Parents" in search suggestions
- Verify teacher only sees children from their assigned groups in search

---

### 3. **Children Page - Position Enforcement Incomplete**
**Severity:** MEDIUM  
**Status:** ⚠️ PARTIALLY FIXED

#### Backend:
✅ POST `/api/children` restricted to admin + manager/receptionist  
✅ GET `/api/children` filters by position (teacher/assistant see only assigned groups)  
⚠️ Other endpoints (PUT, DELETE) may need similar position checks

#### Frontend:
✅ "Add Child" button hidden from teachers/assistants  
⚠️ Edit/Delete actions may still be accessible via UI or API

---

### 4. **Sidebar Navigation - Correct but Not Sufficient**
**Severity:** LOW  
**Status:** ✅ CORRECT (But defense in depth needed)

#### Current State:
- Sidebar correctly filters menu items by `staffInfo.position`
- Parents menu item only shown to manager/receptionist
- Dashboard/Attendance visible to teacher/assistant/manager

#### Why It's Not Enough:
- Hiding UI elements is NOT security - just UX
- Backend MUST enforce the same restrictions
- Direct URL access bypasses sidebar filtering

---

### 5. **Teacher "Jhon" Account Issues**
**Severity:** MEDIUM  
**Status:** ❓ NEEDS INVESTIGATION

#### Symptoms:
- New teachers see assigned groups correctly
- Old teacher "Jhon" cannot see groups (except Lion)
- May be data migration issue with `Staff.assignedClasses`

#### Potential Causes:
1. `assignedClasses` field contains String IDs instead of ObjectId refs
2. Staff record not linked to User correctly
3. `staffInfo` not loaded in `/auth/me` response
4. Groups not synced after schema change (String[] → ObjectId[])

#### Investigation Needed:
- Query Jhon's User and Staff records in MongoDB
- Verify `assignedClasses` contains valid Group ObjectIds
- Check if `/auth/me` returns `staffInfo` for Jhon
- Reassign Jhon to groups via UI to trigger sync

---

### 6. **Add Child Button - UI Condition Edge Case**
**Severity:** LOW  
**Status:** ⚠️ NEEDS VERIFICATION

#### Issue:
- Button visibility condition checks position
- When children list is empty, button may still appear for teachers
- Backend prevents creation, but UI should be consistent

#### Current Condition (ChildrenList.jsx):
```jsx
{(user?.role === 'admin' || 
  (user?.role === 'staff' && 
   ['manager', 'receptionist'].includes(user?.staffInfo?.position))) && (
  <Button onClick={openForm} icon={FiPlus}>Add Child</Button>
)}
```

#### Needs Testing:
- Login as teacher with no assigned children
- Check if "Add Child" button appears when list is empty
- Verify `user.staffInfo.position` is loaded correctly

---

## 📊 POSITION-BASED ACCESS MATRIX

| Feature | Admin | Manager | Receptionist | Teacher | Assistant | Nurse |
|---------|-------|---------|--------------|---------|-----------|-------|
| **Pages** |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Children List | ✅ | ✅ | ✅ | ✅ (assigned) | ✅ (assigned) | ❌ |
| Parents | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Classes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Groups | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Payments | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Activities | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enrollment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Actions** |
| Add Child | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Child | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Child | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Process Payment | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Allowed
- ❌ = Forbidden
- ⚠️ = Partially implemented
- ❓ = Unknown/Needs testing

---

## 🛠️ REQUIRED FIXES (Priority Order)

### Priority 1: Parents Page Backend Enforcement
**Must Fix Immediately**

1. **Add position-based middleware to parent routes:**
   ```javascript
   // authRoutes.js
   import { requireStaffPositions } from '../middleware/staffPosition.js';
   
   router.get('/users', 
     authorize('admin', 'staff'),
     requireStaffPositions(['manager', 'receptionist']),
     getUsers
   );
   ```

2. **Update App.tsx route:**
   ```tsx
   <Route
     path="/parents"
     element={
       <PrivateRoute 
         allowedRoles={['admin', 'staff']} 
         allowedPositions={['manager', 'receptionist']}  // ✅ Add this
       >
         <ParentList onSearchClick={handleSearchClick} />
       </PrivateRoute>
     }
   />
   ```

3. **Test:**
   - Login as nurse → Navigate to `/parents` → Should redirect to dashboard
   - Login as teacher → Navigate to `/parents` → Should redirect to dashboard
   - Login as manager → Navigate to `/parents` → Should see parent list

---

### Priority 2: Children CRUD Actions Position Enforcement

1. **Backend - Add position checks to child routes:**
   ```javascript
   // childrenRoutes.js
   router.put('/:id', 
     protect, 
     authorize('admin', 'staff'),
     requireStaffPositions(['manager', 'receptionist']),  // Add this
     childValidation.update, 
     validate, 
     updateChild
   );
   
   router.delete('/:id', 
     protect, 
     authorize('admin', 'staff'),
     requireStaffPositions(['manager', 'receptionist']),  // Add this
     deleteChild
   );
   ```

2. **Frontend - Hide edit/delete buttons for teachers/assistants:**
   ```jsx
   // ChildProfile.jsx - Conditional rendering
   {(user?.role === 'admin' || 
     (user?.role === 'staff' && 
      ['manager', 'receptionist'].includes(user?.staffInfo?.position))) && (
     <>
       <Button onClick={handleEdit}>Edit</Button>
       <Button onClick={handleDelete}>Delete</Button>
     </>
   )}
   ```

---

### Priority 3: Investigate & Fix Teacher "Jhon" Account

1. **Database Query:**
   ```javascript
   // Check Jhon's records
   db.users.findOne({ email: "jhon@nursery.com" })
   db.staff.findOne({ user: ObjectId("...") })
   ```

2. **Verify assignedClasses:**
   - Should contain ObjectId[] not String[]
   - Should match Group _id values

3. **Fix if needed:**
   - Re-assign Jhon to groups via UI (triggers sync)
   - Or manually update Staff record:
   ```javascript
   db.staff.updateOne(
     { user: ObjectId("...") },
     { $set: { assignedClasses: [ObjectId("..."), ObjectId("...")] } }
   )
   ```

---

### Priority 4: Add Position Checks to Other Sensitive Routes

**Routes needing position middleware:**
- `PUT /api/children/:id` - manager/receptionist only
- `DELETE /api/children/:id` - manager/receptionist only
- `POST /api/groups` - manager only
- `PUT /api/groups/:id` - manager only
- `DELETE /api/groups/:id` - manager only
- `POST /api/classes` - manager only
- `PUT /api/classes/:id` - manager only
- `DELETE /api/classes/:id` - manager only

---

### Priority 5: Testing Checklist

Create test scenarios for each staff position:

#### Teacher Test:
- [ ] Can see Dashboard
- [ ] Can see Attendance page
- [ ] Can see Activities page
- [ ] Can see Children (only assigned groups)
- [ ] Can see Messages
- [ ] CANNOT see Parents page
- [ ] CANNOT see Groups/Classes pages
- [ ] CANNOT add/edit/delete children
- [ ] CANNOT access `/parents` via URL

#### Nurse Test:
- [ ] Can see Dashboard
- [ ] Can see Messages
- [ ] CANNOT see Parents page
- [ ] CANNOT see Attendance page
- [ ] CANNOT see Activities page
- [ ] CANNOT access `/parents` via URL
- [ ] Universal search shows NO parent results

#### Receptionist Test:
- [ ] Can see Dashboard
- [ ] Can see Parents page
- [ ] Can see Payments page
- [ ] Can see Children page
- [ ] Can add children
- [ ] CANNOT edit existing children (or CAN? - needs clarification)
- [ ] CANNOT see Attendance page

#### Manager Test:
- [ ] Can see all staff pages (Parents, Classes, Groups, Enrollment)
- [ ] CANNOT see Payments page
- [ ] Can create/edit groups
- [ ] Can assign instructors to groups

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Immediate Security Hardening (Day 1)
1. ✅ Add position checks to Parent routes (backend + frontend)
2. ✅ Add position middleware to child edit/delete endpoints
3. ✅ Test nurse accessing parent page (should fail)
4. ✅ Test teacher accessing parent page (should fail)

### Phase 2: Complete Position Enforcement (Day 2)
5. ✅ Add position checks to all CRUD endpoints (children, groups, classes)
6. ✅ Update PrivateRoute for all sensitive pages
7. ✅ Hide edit/delete buttons based on position (frontend)
8. ✅ Create automated test suite for position-based access

### Phase 3: Data Integrity & Legacy Fixes (Day 3)
9. ✅ Investigate Jhon teacher account issue
10. ✅ Verify all Staff.assignedClasses are ObjectId refs
11. ✅ Run migration script if needed to fix legacy data
12. ✅ Test old vs new teacher accounts

### Phase 4: Comprehensive Testing (Day 4)
13. ✅ Test all 5 staff positions (teacher, assistant, manager, nurse, receptionist)
14. ✅ Test universal search for each position
15. ✅ Test direct URL navigation for each position
16. ✅ Test API endpoints with different position tokens

---

## 📝 CODE CHANGES SUMMARY

### Files Modified Today:
1. ✅ `server/controllers/searchController.js` - Position-based filtering
2. ⏳ `server/routes/authRoutes.js` - NEEDS position middleware
3. ⏳ `client/src/App.tsx` - NEEDS allowedPositions for /parents route
4. ⏳ `server/routes/childrenRoutes.js` - NEEDS position checks for PUT/DELETE
5. ⏳ `client/src/pages/children/ChildProfile.jsx` - NEEDS conditional edit/delete

### Files Previously Fixed:
- ✅ `server/controllers/childrenController.js` - Position filtering
- ✅ `server/middleware/staffPosition.js` - Position enforcement middleware
- ✅ `client/src/components/PrivateRoute.jsx` - Position checking logic
- ✅ `client/src/components/layout/Sidebar.jsx` - Position-based menu
- ✅ `client/src/context/AuthContext.jsx` - staffInfo loading
- ✅ `server/models/Staff.js` - assignedClasses as ObjectId[]
- ✅ `server/controllers/groupController.js` - Instructor syncing

---

## 🎯 SUCCESS CRITERIA

System is considered secure when:

1. ✅ No staff position can access pages outside their permissions via:
   - Direct URL navigation
   - Universal search
   - API endpoints
   - Sidebar links

2. ✅ Triple-layer security enforced:
   - Frontend: UI elements hidden
   - Frontend: PrivateRoute redirects
   - Backend: Middleware blocks requests

3. ✅ All CRUD operations checked by position:
   - Create (POST)
   - Read (GET) - filtered by position
   - Update (PUT)
   - Delete (DELETE)

4. ✅ Data integrity maintained:
   - Staff.assignedClasses are ObjectId refs
   - Group.instructors sync with Staff.assignedClasses
   - staffInfo loaded in auth middleware

5. ✅ All test accounts work correctly:
   - New accounts
   - Legacy accounts (like Jhon)
   - All 5 staff positions

---

## 📞 NEXT STEPS

**Immediate Action Required:**
1. Fix Parents page position enforcement (HIGH PRIORITY)
2. Test current implementation with nurse account
3. Add position checks to child edit/delete endpoints
4. Investigate Jhon teacher account database records

**Discussion Needed:**
- Should receptionist be able to EDIT children, or only ADD them?
- Should nurse have any access to children page at all?
- What position should have access to view-only parent info (e.g., for medical emergencies)?

---

**Report Generated:** November 28, 2025  
**Last Updated:** After Universal Search Position Filtering  
**Status:** 🔴 Critical issues remain - immediate fixes required
