# Nursery Management System - Backend

Professional backend API for a complete Nursery Management System built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control (Admin, Parent, Staff)
- **Security** - Helmet, CORS, Rate Limiting, Input Validation
- **Database** - MongoDB with Mongoose ODM
- **Error Handling** - Centralized error handling with custom error classes
- **Code Quality** - Clean architecture with separation of concerns

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual values
```

3. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/             # Request handlers
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   ├── notFound.js          # 404 handler
│   └── validate.js          # Validation middleware
├── models/                  # Mongoose schemas
├── routes/                  # API routes
├── services/                # Business logic
├── utils/
│   ├── constants.js         # App constants
│   ├── errorResponse.js     # Custom error class
│   ├── helpers.js           # Helper functions
│   └── responseHandler.js   # Response formatters
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Entry point
```

## 🔐 Environment Variables

See `.env.example` for all available options.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS

## 🧪 API Testing

Once the server is running, test the health check endpoint:
```bash
curl http://localhost:5000
```

## 📚 Next Steps

1. Create database models (User, Child, Staff, etc.)
2. Implement authentication routes
3. Build CRUD operations for each module
4. Add file upload functionality
5. Implement dashboard analytics

## 📝 License

ISC
