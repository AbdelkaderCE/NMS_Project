# API Documentation

Base URL: `http://localhost:5000/api`

---

# 🔐 Authentication API

Base: `/api/auth`

---

## 📝 Public Endpoints (No Authentication Required)

### 1. Register User
**POST** `/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "parent",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "parent",
      "isActive": true
    }
  }
}
```

---

### 2. Login
**POST** `/login`

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "parent",
      "lastLogin": "2025-11-20T10:30:00.000Z"
    }
  }
}
```

---

### 3. Forgot Password
**POST** `/forgot-password`

**Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token generated",
  "data": {
    "resetToken": "abc123...",
    "message": "Password reset email sent"
  }
}
```

---

### 4. Reset Password
**PUT** `/reset-password/:resetToken`

**Body:**
```json
{
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

## 🔒 Protected Endpoints (Authentication Required)

**Headers Required:**
```
Authorization: Bearer <your_jwt_token>
```

### 5. Get Current User
**GET** `/me`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "parent",
    "phone": "+1234567890",
    "address": { ... },
    "isActive": true,
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```

---

### 6. Update Profile
**PUT** `/profile`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+9876543210",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 7. Update Password
**PUT** `/password`

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

### 8. Logout
**POST** `/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔑 User Roles

- `admin` - Full system access
- `parent` - Access to own children's data
- `staff` - Access to assigned children/classes

---

## 📌 Notes

1. **Token Storage**: Save the JWT token from login/register response
2. **Token Usage**: Include token in Authorization header for protected routes
3. **Token Expiry**: Default is 7 days (configurable in .env)
4. **Password Reset**: In production, resetToken will be sent via email
5. **Cookies**: Token is also stored in httpOnly cookie for additional security

---

## 🧪 Testing with cURL

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "parent"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

# 👶 Children Management API

Base: `/api/children`

**All endpoints require authentication (JWT token)**

---

## 📊 Statistics

### Get Children Statistics
**GET** `/stats`

**Access:** Admin, Staff only

**Response:**
```json
{
  "success": true,
  "message": "Children statistics retrieved successfully",
  "data": {
    "total": 50,
    "active": 45,
    "inactive": 3,
    "graduated": 2,
    "byClass": [
      { "_id": "Toddlers", "count": 15 },
      { "_id": "Preschool", "count": 20 },
      { "_id": "Kindergarten", "count": 10 }
    ],
    "ageDistribution": [
      { "_id": 2, "count": 10 },
      { "_id": 3, "count": 15 },
      { "_id": 4, "count": 12 }
    ]
  }
}
```

---

## 📝 CRUD Operations

### 1. Create Child
**POST** `/`

**Access:** Admin, Staff only

**Body:**
```json
{
  "firstName": "Emma",
  "lastName": "Johnson",
  "dateOfBirth": "2021-05-15",
  "gender": "female",
  "enrollmentDate": "2024-01-10",
  "classGroup": "Toddlers",
  "parents": [
    {
      "parent": "USER_ID_HERE",
      "relationship": "mother",
      "isPrimary": true
    }
  ],
  "medicalInfo": {
    "bloodType": "A+",
    "allergies": [
      {
        "name": "Peanuts",
        "severity": "severe",
        "notes": "Carries EpiPen"
      }
    ],
    "doctorName": "Dr. Smith",
    "doctorPhone": "+1234567890"
  },
  "emergencyContacts": [
    {
      "name": "Jane Johnson",
      "relationship": "Mother",
      "phone": "+1234567890",
      "email": "jane@example.com",
      "isPrimary": true
    }
  ],
  "dietaryRestrictions": ["No nuts", "Lactose intolerant"],
  "specialNeeds": "None",
  "notes": "Very active child"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Child created successfully",
  "data": {
    "_id": "...",
    "firstName": "Emma",
    "lastName": "Johnson",
    "fullName": "Emma Johnson",
    "age": 3,
    "parents": [...]
  }
}
```

---

### 2. Get All Children
**GET** `/`

**Access:** 
- Admin/Staff: See all children
- Parents: See only their own children

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10, max: 100)
- `status` (string) - Filter by status (active, inactive, graduated)
- `classGroup` (string) - Filter by class
- `search` (string) - Search by first or last name

**Example:** `/api/children?page=1&limit=10&status=active&search=Emma`

**Response:**
```json
{
  "success": true,
  "message": "Children retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 45,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Child by ID
**GET** `/:id`

**Access:** 
- Admin/Staff: Any child
- Parents: Own children only

**Response:**
```json
{
  "success": true,
  "message": "Child retrieved successfully",
  "data": {
    "_id": "...",
    "firstName": "Emma",
    "lastName": "Johnson",
    "dateOfBirth": "2021-05-15",
    "age": 3,
    "gender": "female",
    "status": "active",
    "parents": [...],
    "medicalInfo": {...},
    "emergencyContacts": [...]
  }
}
```

---

### 4. Update Child
**PUT** `/:id`

**Access:** Admin, Staff only

**Body:** (All fields optional)
```json
{
  "firstName": "Emma",
  "classGroup": "Preschool",
  "status": "active",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Child updated successfully",
  "data": {...}
}
```

---

### 5. Delete Child
**DELETE** `/:id`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Child deleted successfully"
}
```

---

## 👨‍👩‍👧 Parent Management

### Add Parent to Child
**POST** `/:id/parents`

**Access:** Admin, Staff only

**Body:**
```json
{
  "parent": "USER_ID",
  "relationship": "father",
  "isPrimary": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent added successfully",
  "data": {...}
}
```

---

### Remove Parent from Child
**DELETE** `/:id/parents/:parentId`

**Access:** Admin, Staff only

**Note:** Cannot remove if child has only one parent

**Response:**
```json
{
  "success": true,
  "message": "Parent removed successfully",
  "data": {...}
}
```

---

## 🏥 Medical Information

### Update Medical Info
**PUT** `/:id/medical`

**Access:** Admin, Staff only

**Body:**
```json
{
  "bloodType": "O+",
  "allergies": [
    {
      "name": "Dairy",
      "severity": "mild",
      "notes": "Lactose intolerant"
    }
  ],
  "medications": [
    {
      "name": "Allergy Relief",
      "dosage": "5ml",
      "frequency": "Daily",
      "notes": "Morning only"
    }
  ],
  "conditions": ["Asthma"],
  "doctorName": "Dr. Brown",
  "doctorPhone": "+9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical information updated successfully",
  "data": {...}
}
```

---

## 🚨 Emergency Contacts

### Add Emergency Contact
**POST** `/:id/emergency-contacts`

**Access:** Admin, Staff only

**Body:**
```json
{
  "name": "John Johnson",
  "relationship": "Father",
  "phone": "+1234567890",
  "email": "john@example.com",
  "isPrimary": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency contact added successfully",
  "data": {...}
}
```

---

### Remove Emergency Contact
**DELETE** `/:id/emergency-contacts/:contactId`

**Access:** Admin, Staff only

**Response:**
```json
{
  "success": true,
  "message": "Emergency contact removed successfully",
  "data": {...}
}
```

---

## 🧪 Testing Examples

### Create a child:
```bash
curl -X POST http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emma",
    "lastName": "Johnson",
    "dateOfBirth": "2021-05-15",
    "gender": "female",
    "parents": [{
      "parent": "PARENT_USER_ID",
      "relationship": "mother",
      "isPrimary": true
    }]
  }'
```

### Get all children (with filters):
```bash
curl -X GET "http://localhost:5000/api/children?status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get child statistics:
```bash
curl -X GET http://localhost:5000/api/children/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
