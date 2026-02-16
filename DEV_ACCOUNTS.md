# 🎓 Development Database Setup - Quick Reference

## 📋 Summary

✅ Fresh database created with 16 children across 4 classes
✅ 5 staff members (one per position with full details)
✅ 1 admin user
✅ 13 parent accounts (1 primary + 12 additional)
✅ 128 attendance records for testing
✅ Full group structure and class organization

---

## 🔐 Login Credentials

### 👨‍💼 Admin User
```
Email: admin@school.dev
Password: Admin@2025
Role: Admin (Full System Access)
```

### 👥 Staff Members (One Per Position)

#### 1️⃣ Teacher
```
Email: staff1.user@school.dev
Password: Staffteacher@2025
Position: Teacher
Employee ID: EMP001
Department: Education
```

#### 2️⃣ Teacher Assistant
```
Email: staff2.user@school.dev
Password: Staffassistant@2025
Position: Teacher Assistant
Employee ID: EMP002
Department: Education
```

#### 3️⃣ Manager
```
Email: staff3.user@school.dev
Password: Staffmanager@2025
Position: Manager
Employee ID: EMP003
Department: Education
```

#### 4️⃣ School Nurse
```
Email: staff4.user@school.dev
Password: Staffnurse@2025
Position: School Nurse
Employee ID: EMP004
Department: Education
```

#### 5️⃣ Receptionist
```
Email: staff5.user@school.dev
Password: Staffreceptionist@2025
Position: Receptionist
Employee ID: EMP005
Department: Education
```

### 👨‍👩‍👧 Parent Accounts

#### Main Parent (WITH 4 CHILDREN) ⭐
```
Email: parent@school.dev
Password: Parent@2025
Children:
  1. Youssef Rashid (Nursery A)
  2. Leila Khalil (Nursery B)
  3. Muhammad Nassar (Pre-K)
  4. Dina Mohammad (Kindergarten)
```

#### Additional Test Parents (for diversity testing)
```
Pattern: parent{N}@school.dev / Parent{N}@2025

Available parents:
- parent0@school.dev / Parent0@2025
- parent1@school.dev / Parent1@2025
- parent2@school.dev / Parent2@2025
- parent3@school.dev / Parent3@2025
- parent4@school.dev / Parent4@2025
- parent5@school.dev / Parent5@2025
- parent6@school.dev / Parent6@2025
- parent7@school.dev / Parent7@2025
- parent8@school.dev / Parent8@2025
- parent9@school.dev / Parent9@2025
- parent10@school.dev / Parent10@2025
- parent11@school.dev / Parent11@2025

(Each has 1 child enrolled in different classes)
```

---

## 📚 Database Structure

### Classes (4)
- **Nursery A** - Ages 1-2 years (Fee: $300)
- **Nursery B** - Ages 2-3 years (Fee: $350)
- **Pre-K** - Ages 3-4 years (Fee: $400)
- **Kindergarten** - Ages 4-5 years (Fee: $450)

### Groups (8)
- 2 groups per class
- Group A & Group B in each class
- All assigned to Teacher (staff1.user@school.dev)

### Children (16 Total)
- 4 children linked to main parent
- 12 additional children (each with own parent)
- Random distribution across classes
- Ages aligned with class age ranges
- 10 days of attendance history

### Attendance Records (128)
- Last 10 school days
- Mix of statuses: Present, Absent, Late, Sick
- All recorded by Teacher

---

## 🚀 How to Use

### 1. Start Your Development Server
```bash
cd server
npm run dev
```

### 2. Reset Database (anytime)
```bash
npm run setup:dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017/nms-dev

---

## 🧪 Testing Scenarios

### For Task 2 (Absence Excuse System Testing):

**As Parent (parent@school.dev):**
1. Log in with parent account
2. Submit absence excuses for any of the 4 children
3. Attach supporting documents
4. View submitted excuses

**As Teacher (staff1.user@school.dev):**
1. Log in with teacher account
2. View pending absence excuses for your class children
3. Approve or reject with review notes
4. Verify notifications sent

**As Admin (admin@school.dev):**
1. Log in with admin account
2. View all absence excuses system-wide
3. Manage staff and parents
4. Oversee all operations

---

## 📝 Notes

- ✅ All passwords follow same pattern for easy memorization
- ✅ Staff members have complete employment details
- ✅ Qualifications and certifications pre-filled
- ✅ Parents have full family trees set up
- ✅ Children have proper age dates and health info
- ✅ Ready for feature development and testing
- ✅ Can be reset anytime with `npm run setup:dev`

---

## 🔧 Script Location

Run setup anytime with:
```bash
npm run setup:dev
```

Script: `server/setupDevDatabase.js`

---

**Last Updated:** December 5, 2025
**Status:** ✅ Ready for Development
