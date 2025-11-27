# 🔑 Test Accounts - Nursery Management System

## Quick Access Credentials

### Admin Account
- **Email:** admin@nursery.com
- **Password:** admin123
- **Role:** Administrator
- **Access:** Full system access including staff management

### Staff Account
- **Email:** staff@nursery.com
- **Password:** staff123
- **Role:** Staff Member
- **Access:** Children, attendance, activities, messages (no staff management)

### Parent Account
- **Email:** parent@nursery.com
- **Password:** parent123
- **Role:** Parent
- **Access:** Own children, payments, activities, messages

---

## Server Status

### Backend API
- **URL:** http://localhost:5000
- **Status:** ✅ Running
- **Database:** MongoDB (nursery_management)

### Frontend Application
- **URL:** http://localhost:5173
- **Status:** ✅ Running
- **Framework:** React + Vite + Tailwind CSS

---

## How to Test

1. **Open the frontend:** http://localhost:5173
2. **Click on "Register here"** or use existing test accounts
3. **Login with any test account** above
4. **Explore role-based features:**
   - Admin: Can access all modules including staff management
   - Staff: Can manage daily operations (no staff management)
   - Parent: Can view their children's information and communicate

---

## Reset Test Accounts

If you need to reset the test accounts, run:
```bash
cd server
npm run seed
```

This will recreate all test accounts with default passwords.

---

## Registration Fixed

The registration system now accepts both formats:
- **Format 1 (Backend):** `firstName` + `lastName` + `email` + `password` + `phone`
- **Format 2 (Frontend):** `name` + `email` + `password` + `role`

The backend automatically splits the `name` field into `firstName` and `lastName` if needed.

---

## Next Steps

1. ✅ Backend setup complete (94 API endpoints)
2. ✅ Frontend layout and navigation complete
3. ✅ Authentication system working
4. ✅ Test accounts created for all roles
5. ✅ Children Management module complete (full CRUD operations)
6. ✅ Staff Management module complete (Admin only)
7. ✅ Attendance tracking module complete (Check-in/Check-out, Daily view)
8. 🔄 Next: Build Payments module
9. 🔄 Next: Build Activities scheduling module
10. 🔄 Next: Build Messaging system
