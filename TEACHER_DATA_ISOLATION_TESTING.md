# Teacher Data Isolation - Testing Guide

## Quick Start Testing

### Prerequisites
- Server running on port 5000
- Postman or curl for API testing
- Test data with multiple teachers in different classes

---

## Test Data Setup

### Required Data Structure
```
Classes:
- Class-1 (ID: class1_id)
- Class-2 (ID: class2_id)

Teachers:
- Teacher-A (user_id: teacher_a_id) → Assigned to Class-1
- Teacher-B (user_id: teacher_b_id) → Assigned to Class-2

Children:
- Child-1 (assignedClass: Class-1)
- Child-2 (assignedClass: Class-2)

Attendance:
- Records for both children from previous dates
```

---

## Test Cases

### Test 1: Teacher Can See Only Their Class Children

**Endpoint**: `GET /api/children`

**Setup**: 
- Login as Teacher-A (assigned to Class-1 only)
- Token: `{token_a}`

**Request**:
```bash
curl -H "Authorization: Bearer {token_a}" \
  http://localhost:5000/api/children
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    { "id": "child1_id", "firstName": "Child", "lastName": "One", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

**Validation**:
- ✅ Returns only Child-1 (in Class-1)
- ✅ Does NOT return Child-2 (in Class-2)
- ✅ Response status: 200

---

### Test 2: Teacher Cannot See Unauthorized Child Details

**Endpoint**: `GET /api/children/{child2_id}`

**Setup**:
- Login as Teacher-A (assigned to Class-1 only)
- Token: `{token_a}`
- child2_id: ID of Child in Class-2

**Request**:
```bash
curl -H "Authorization: Bearer {token_a}" \
  http://localhost:5000/api/children/{child2_id}
```

**Expected Response**:
```json
{
  "success": false,
  "message": "This child is not in any of your assigned classes",
  "statusCode": 403
}
```

**Validation**:
- ✅ Response status: 403 Forbidden
- ✅ Error message indicates class mismatch
- ✅ No child data returned

---

### Test 3: Teacher Can See Authorized Child Details

**Endpoint**: `GET /api/children/{child1_id}`

**Setup**:
- Login as Teacher-A (assigned to Class-1)
- Token: `{token_a}`
- child1_id: ID of Child in Class-1

**Request**:
```bash
curl -H "Authorization: Bearer {token_a}" \
  http://localhost:5000/api/children/{child1_id}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Child retrieved successfully",
  "data": {
    "id": "child1_id",
    "firstName": "Child",
    "lastName": "One",
    "assignedClass": "class1_id",
    ...
  }
}
```

**Validation**:
- ✅ Response status: 200
- ✅ Full child data returned
- ✅ Belongs to teacher's assigned class

---

### Test 4: Teacher Cannot Mark Attendance for Unauthorized Child

**Endpoint**: `POST /api/attendance`

**Setup**:
- Login as Teacher-A (assigned to Class-1 only)
- Token: `{token_a}`

**Request Body**:
```json
{
  "child": "{child2_id}",
  "date": "2025-01-15",
  "status": "PRESENT"
}
```

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token_a}" \
  -H "Content-Type: application/json" \
  -d '{"child": "{child2_id}", "date": "2025-01-15", "status": "PRESENT"}' \
  http://localhost:5000/api/attendance
```

**Expected Response**:
```json
{
  "success": false,
  "message": "This child is not in any of your assigned classes",
  "statusCode": 403
}
```

**Validation**:
- ✅ Response status: 403 Forbidden
- ✅ Attendance record NOT created
- ✅ Error message indicates class mismatch

---

### Test 5: Teacher Can Mark Attendance for Authorized Child

**Endpoint**: `POST /api/attendance`

**Setup**:
- Login as Teacher-A (assigned to Class-1)
- Token: `{token_a}`

**Request Body**:
```json
{
  "child": "{child1_id}",
  "date": "2025-01-15",
  "status": "PRESENT"
}
```

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token_a}" \
  -H "Content-Type: application/json" \
  -d '{"child": "{child1_id}", "date": "2025-01-15", "status": "PRESENT"}' \
  http://localhost:5000/api/attendance
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance record created successfully",
  "data": {
    "id": "attendance_id",
    "child": "{child1_id}",
    "date": "2025-01-15",
    "status": "PRESENT",
    "recordedBy": "teacher_a_id",
    ...
  }
}
```

**Validation**:
- ✅ Response status: 201
- ✅ Attendance record created
- ✅ recordedBy field matches teacher

---

### Test 6: Teacher Can View Only Their Class Attendance

**Endpoint**: `GET /api/attendance`

**Setup**:
- Login as Teacher-A (assigned to Class-1)
- Token: `{token_a}`
- System has attendance for both Class-1 and Class-2 children

**Request**:
```bash
curl -H "Authorization: Bearer {token_a}" \
  http://localhost:5000/api/attendance
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": [
    { "id": "att1", "child": "child1_id", ... },
    { "id": "att1b", "child": "child1_id", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

**Validation**:
- ✅ Only returns attendance for Class-1 children
- ✅ Does NOT return attendance for Class-2 children
- ✅ Response status: 200

---

### Test 7: Teacher Can Check In Authorized Child

**Endpoint**: `POST /api/attendance/{attendance_id}/check-in`

**Setup**:
- Login as Teacher-A
- Token: `{token_a}`
- attendance_id: Attendance record for Class-1 child

**Request Body**:
```json
{
  "temperature": 37.5
}
```

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token_a}" \
  -H "Content-Type: application/json" \
  -d '{"temperature": 37.5}' \
  http://localhost:5000/api/attendance/{attendance_id}/check-in
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Child checked in successfully",
  "data": {
    "id": "attendance_id",
    "checkInTime": "2025-01-15T08:30:00.000Z",
    "checkInBy": "teacher_a_id",
    ...
  }
}
```

**Validation**:
- ✅ Response status: 200
- ✅ checkInTime recorded
- ✅ checkInBy set to teacher

---

### Test 8: Teacher Cannot Check In Unauthorized Child

**Endpoint**: `POST /api/attendance/{unauthorized_attendance_id}/check-in`

**Setup**:
- Login as Teacher-A (assigned to Class-1 only)
- Token: `{token_a}`
- unauthorized_attendance_id: Attendance for Class-2 child

**Request Body**:
```json
{
  "temperature": 37.0
}
```

**Expected Response**:
```json
{
  "success": false,
  "message": "This child is not in any of your assigned classes",
  "statusCode": 403
}
```

**Validation**:
- ✅ Response status: 403 Forbidden
- ✅ Check-in NOT recorded
- ✅ Cannot access unauthorized child

---

### Test 9: Teacher Cannot Check Out Unauthorized Child

**Endpoint**: `POST /api/attendance/{unauthorized_attendance_id}/check-out`

**Setup**:
- Login as Teacher-A
- Token: `{token_a}`
- unauthorized_attendance_id: Attendance for Class-2 child (already checked in)

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token_a}" \
  http://localhost:5000/api/attendance/{unauthorized_attendance_id}/check-out
```

**Expected Response**:
```json
{
  "success": false,
  "message": "This child is not in any of your assigned classes",
  "statusCode": 403
}
```

**Validation**:
- ✅ Response status: 403 Forbidden
- ✅ Check-out NOT recorded

---

### Test 10: Teacher Without Assigned Classes

**Endpoint**: `GET /api/children`

**Setup**:
- Create new teacher with NO assigned classes
- Login as New-Teacher
- Token: `{new_token}`

**Request**:
```bash
curl -H "Authorization: Bearer {new_token}" \
  http://localhost:5000/api/children
```

**Expected Response**:
```json
{
  "success": true,
  "message": "No assigned classes available",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0
  }
}
```

**Validation**:
- ✅ Response status: 200 (NOT 403)
- ✅ Returns empty array
- ✅ Graceful handling of no assignments

---

### Test 11: Parent Access Still Works

**Endpoint**: `GET /api/children`

**Setup**:
- Login as parent
- Token: `{parent_token}`
- Parent is assigned to one child

**Request**:
```bash
curl -H "Authorization: Bearer {parent_token}" \
  http://localhost:5000/api/children
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    { "id": "child_id", "firstName": "...", ... }
  ]
}
```

**Validation**:
- ✅ Parent can still see their own children
- ✅ Parent sees only their children (no changes from before)
- ✅ Existing authorization still works

---

### Test 12: Admin Access Still Works

**Endpoint**: `GET /api/children`

**Setup**:
- Login as admin
- Token: `{admin_token}`

**Request**:
```bash
curl -H "Authorization: Bearer {admin_token}" \
  http://localhost:5000/api/children
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    { "id": "child1_id", ... },
    { "id": "child2_id", ... }
  ]
}
```

**Validation**:
- ✅ Admin can see ALL children
- ✅ No restrictions applied to admin
- ✅ Existing admin access preserved

---

## Summary Checklist

### Security Tests
- [ ] Teacher A cannot access Class 2 children
- [ ] Teacher B cannot access Class 1 children
- [ ] Teacher without classes gets empty results (not error)
- [ ] Attendance creation validates class ownership
- [ ] Attendance check-in validates class ownership
- [ ] Attendance check-out validates class ownership

### Functionality Tests
- [ ] Teachers can perform all operations on their class children
- [ ] Parents still see only their children
- [ ] Admins still see all children
- [ ] Existing authorization patterns work

### Error Handling Tests
- [ ] Proper 403 errors for unauthorized access
- [ ] Proper 404 errors for missing resources
- [ ] Proper error messages
- [ ] No server errors (500) in responses

### Performance Tests
- [ ] Response time acceptable (< 500ms)
- [ ] List endpoints perform well with large datasets
- [ ] Database queries efficient

---

## Test Environment Setup Script

```bash
# Start server
cd /path/to/server
npm start

# In another terminal, run tests
npm test -- --testPath="./tests/teacher-isolation.test.js"

# Or manually test with curl/Postman
```

---

## Rollback Plan

If issues found:
1. Revert middleware changes
2. Revert route changes
3. Revert controller changes
4. Restart server
5. Verify existing functionality restored

```bash
git revert <commit-hash>
```

---

## Success Criteria

✅ All 12 test cases pass  
✅ No security vulnerabilities found  
✅ Teacher data isolation enforced  
✅ No regressions in existing functionality  
✅ Performance acceptable  
✅ Ready for production deployment
