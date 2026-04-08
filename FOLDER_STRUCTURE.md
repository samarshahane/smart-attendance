# Smart Attendance System - Folder Structure

```
smart-attendance-system/
│
├── backend/                    ← Node.js Express Server
│   ├── server.js               ← Main entry point
│   ├── package.json            ← Dependencies
│   ├── .env                    ← Environment variables (DO NOT COMMIT)
│   ├── .env.example            ← Template for .env
│   ├── .gitignore
│   │
│   ├── models/                 ← MongoDB Schemas (Database Structure)
│   │   ├── User.js             ← User schema (name, email, password)
│   │   └── Attendance.js       ← Attendance schema (userId, date, time)
│   │
│   ├── routes/                 ← API Route Handlers
│   │   ├── authRoutes.js       ← POST /register, POST /login
│   │   └── attendanceRoutes.js ← POST /mark, GET /records
│   │
│   ├── middleware/             ← Custom Middleware
│   │   └── authMiddleware.js   ← JWT token verification
│   │
│   └── public/                 ← Frontend (served by Express)
│       ├── index.html          ← Main HTML (Single Page App)
│       ├── css/
│       │   └── style.css       ← All styling
│       └── js/
│           └── app.js          ← Frontend JavaScript
│
├── docs/                       ← Documentation
│   └── aws-deployment.md       ← AWS deployment guide
│
└── README.md                   ← Project documentation
```

## Technology Stack

| Layer      | Technology          | Purpose                    |
|------------|---------------------|----------------------------|
| Frontend   | HTML + CSS + JS     | User Interface             |
| Backend    | Node.js + Express   | API Server (on AWS EC2)    |
| Database   | MongoDB Atlas       | Cloud Database (DBaaS)     |
| Auth       | JWT + bcrypt        | Security                   |
| Hosting    | AWS EC2 (t2.micro)  | IaaS Cloud Hosting         |
