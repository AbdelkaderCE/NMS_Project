# Quick Test Guide - All Fixes

## 1. Start the System

```bash
# Terminal 1: Start MongoDB (if not running)
mongod

# Terminal 2: Start Server
cd server
npm start

# Terminal 3: Start Client
cd client
npm run dev
```

## 2. Test Login - All Accounts Now Work ✅

### Admin Account
- Email: `admin@school.dev`
- Password: `Admin@2025`
- Expected: Login successful, see Dashboard

### Teacher Account
- Email: `staff1.user@school.dev`
- Password: `Staffteacher@2025`
- Expected: Login successful, see Children list

### Parent Account
- Email: `parent@school.dev`
- Password: `Parent@2025`
- Expected: Login successful, see 4 children

---

## 3. Test Activity Creation (Fix #3)

**As Teacher (staff1.user@school.dev)**:

1. Go to Activities page
2. Create Activity for Group (no child selected)
   - Should work without "Invalid child ID" error ✅
3. Create Activity for specific child
   - Should work correctly ✅
4. Create Activity for entire class
   - Should work without validation errors ✅

---

## 4. Test Teacher Visibility (Fix #4)

**As Teacher (staff1.user@school.dev)**:

1. Go to Children List
   - Should see all 16 children (including group-assigned children) ✅
2. Click on a child from the group
   - Should see child details ✅
3. Go to Attendance page
   - Should see all children from assigned groups ✅
4. Mark attendance
   - Should work correctly ✅

---

## 5. Test Admin Privileges (Fix #2)

**As Admin (admin@school.dev)**:

1. Go to Groups page
   - Should be able to create new group ✅
   - Should be able to edit group ✅
   - Should be able to assign instructor ✅
   - Should be able to delete group ✅

2. Go to Classes page
   - Should be able to create new class ✅
   - Should be able to edit class ✅
   - Should be able to delete class ✅

3. Go to Children page
   - Should be able to create new child ✅
   - Should be able to edit child ✅
   - Should be able to delete child ✅

---

## 6. Test Absence Excuse System (Still Working ✅)

**As Parent (parent@school.dev)**:

1. Go to Absence Excuse page
2. Submit excuse for one of the 4 children
   - Should work correctly ✅

**As Teacher (staff1.user@school.dev)**:

1. Go to Absence Excuse Review page
2. Review and approve/reject excuse
   - Should work correctly ✅

---

## 7. Complete Feature Verification

| Feature | Expected | Status |
|---------|----------|--------|
| Login - Admin | ✅ Works | Fixed Fix #1 |
| Login - Teacher | ✅ Works | Fixed Fix #1 |
| Login - Parent | ✅ Works | Fixed Fix #1 |
| Activity Creation | ✅ No validation errors | Fixed Fix #3 |
| Teacher sees children | ✅ See 16 children | Fixed Fix #4 |
| Admin manages resources | ✅ Can CRUD | Fixed Fix #2 |
| Absence excuses | ✅ Works as before | No changes |
| Attendance marking | ✅ Works as before | No changes |

---

## 8. Expected Test Results

✅ All 4 test accounts login successfully
✅ Activity creation works for group/class/child
✅ Teachers see all children in their groups
✅ Admin can manage all resources
✅ Absence excuse system works
✅ Attendance marking works

**If all above pass → System is ready for production testing and Task 3 implementation**

---

## Database Info

**Database**: nms-dev
**Collections**: Users, Staff, Children, Classes, Groups, Activities, Attendance, AbsenceExcuses, etc.

**Test Data**:
- 1 Admin user
- 5 Staff (all positions)
- 13 Parent users
- 16 Children
- 4 Classes
- 8 Groups
- 128 Attendance records

Use: `npm run setup:dev` to reset database anytime

