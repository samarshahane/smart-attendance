# 🎓 Smart Attendance System

A **cloud-based attendance management system** built as a college mini project demonstrating **3-tier cloud architecture** with AWS EC2, MongoDB Atlas, and Node.js.

---

## 🏗️ Architecture Overview

```
Browser (Frontend) → AWS EC2 Node.js (Backend) → MongoDB Atlas (Database)
```

| Tier       | Technology           | Cloud Service         |
|------------|----------------------|-----------------------|
| Frontend   | HTML + CSS + JS      | Served from EC2       |
| Backend    | Node.js + Express    | AWS EC2 (IaaS)        |
| Database   | MongoDB              | MongoDB Atlas (DBaaS) |

---

## 🛠️ Documentation & Guidelines (AWS Compliance)

This project adheres to professional AWS deployment and architecture guidelines. See the detailed documentation below:

| Document | Description |
| :--- | :--- |
| 📝 **[REQUIREMENTS.md](docs/REQUIREMENTS.md)** | Functional and Non-functional specifications. |
| 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | 3-Tier architecture details and Mermaid diagrams. |
| 🧪 **[TESTING.md](docs/TESTING.md)** | Test cases and results for functional & security tests. |
| ☁️ **[aws-deployment.md](docs/aws-deployment.md)** | Full guide for EC2 and MongoDB Atlas setup. |
| 📦 **[S3_SETUP_GUIDE.md](docs/S3_SETUP_GUIDE.md)** | How to set up AWS S3 for profile pictures. |
| 🔑 **[GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md)** | How to configure Google OAuth2 credentials. |
| 🛡️ **[NEW_EC2_SETUP.md](docs/NEW_EC2_SETUP.md)** | Guide for setting up a brand new EC2 instance. |

---

## ✨ Features

- ✅ User Registration with bcrypt password hashing
- ✅ JWT-based login authentication
- ✅ Mark attendance (once per day, with duplicate prevention)
- ✅ View complete attendance history with statistics
- ✅ Live clock and attendance percentage donut chart
- ✅ Responsive dark-themed UI
- ✅ Deployed on AWS EC2 Free Tier

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (free at mongodb.com/atlas)

### Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret

# 4. Start the server
node server.js

# 5. Open browser
# http://localhost:5000
```

---

## 🔌 API Reference

| Method | Endpoint       | Description              | Auth Required |
|--------|----------------|--------------------------|---------------|
| POST   | /api/register  | Create new user account  | No            |
| POST   | /api/login     | Login and get JWT token  | No            |
| POST   | /api/mark      | Mark today's attendance  | Yes (JWT)     |
| GET    | /api/records   | Get attendance records   | Yes (JWT)     |
| GET    | /api/profile   | Get user profile         | Yes (JWT)     |
| GET    | /api/health    | Server health check      | No            |

### Example Requests

**Register:**
```json
POST /api/register
{
  "name": "Rahul Sharma",
  "email": "rahul@college.edu",
  "password": "mypassword123"
}
```

**Login:**
```json
POST /api/login
{
  "email": "rahul@college.edu",
  "password": "mypassword123"
}
```
Response includes `token` to use for protected routes.

**Mark Attendance:**
```json
POST /api/mark
Headers: { "Authorization": "Bearer <your-jwt-token>" }
```

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "email": "rahul@college.edu",
  "password": "$2b$10$hashedpassword...",
  "role": "student",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Attendances Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "userName": "Rahul Sharma",
  "userEmail": "rahul@college.edu",
  "date": "2024-01-15",
  "time": "09:15:00 AM",
  "dayOfWeek": "Monday",
  "status": "present",
  "createdAt": "2024-01-15T03:45:00Z"
}
```

---

## 🔐 Security Features

1. **bcrypt** — Passwords hashed with 10 salt rounds (never stored in plain text)
2. **JWT** — Tokens expire in 24 hours, signed with secret key
3. **Duplicate Prevention** — MongoDB compound index prevents marking attendance twice per day
4. **CORS** — Configured to allow only specific origins
5. **Input Validation** — Server-side validation on all endpoints

---

## ☁️ AWS Deployment

See the detailed guide: [docs/aws-deployment.md](docs/aws-deployment.md)

**Quick summary:**
1. Launch EC2 Ubuntu t2.micro (Free Tier)
2. Open ports 22, 80, 5000 in Security Group
3. SSH into EC2 and install Node.js + Git
4. Clone this repository
5. Create .env with your MongoDB Atlas URI
6. `npm install && node server.js`
7. Use PM2 to keep server running: `pm2 start server.js`

---

## 📁 Project Structure

```
backend/
├── server.js              ← App entry point
├── package.json
├── .env.example
├── models/
│   ├── User.js            ← User schema
│   └── Attendance.js      ← Attendance schema
├── routes/
│   ├── authRoutes.js      ← /register, /login
│   └── attendanceRoutes.js← /mark, /records
├── middleware/
│   └── authMiddleware.js  ← JWT verification
└── public/                ← Frontend files
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

---

## 🛠️ Built With

- **[Express.js](https://expressjs.com/)** - Web framework
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT auth
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database
- **[AWS EC2](https://aws.amazon.com/ec2/)** - Cloud server

---

## 👨‍💻 Made For

Engineering students learning cloud computing concepts for mini projects.
Demonstrates: IaaS, DBaaS, REST APIs, JWT auth, 3-tier architecture.

---

*Smart Attendance System — Cloud Computing Mini Project*
