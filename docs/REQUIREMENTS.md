# Functional and Non-Functional Requirements

## 1. Functional Requirements (FR)

### 1.1 User Authentication
- **FR1.1.1**: Users shall be able to register with name, email, and password.
- **FR1.1.2**: Users shall be able to login using local credentials (JWT-based).
- **FR1.1.3**: Users shall be able to login using **Google OAuth2**.
- **FR1.1.4**: Passwords must be hashed using `bcrypt` before storage.

### 1.2 Attendance Management
- **FR1.2.1**: Users shall be able to mark their attendance once per day.
- **FR1.2.2**: The system shall prevent duplicate attendance records for the same day.
- **FR1.2.3**: Attendance records shall include Date, Time, and Status (Present/Late).

### 1.3 Profile Management
- **FR1.3.1**: Users shall be able to view their attendance dashboard with statistics.
- **FR1.3.2**: Users shall be able to upload a profile picture to **AWS S3**.

### 1.4 Reporting & Analytics
- **FR1.4.1**: Users shall see their total attendance percentage.
- **FR1.4.2**: Users shall see a history of all attendance records in tabular format.

## 2. Non-Functional Requirements (NFR)

### 2.1 Security
- **NFR2.1.1**: All communication should ideally be over HTTPS.
- **NFR2.1.2**: User IDs and sensitive data should not be exposed in plaintext.
- **NFR2.1.3**: AWS credentials should be managed via IAM Roles/Instance Profiles for EC2.

### 2.2 Performance
- **NFR2.2.1**: The dashboard should load attendance records within 2 seconds.
- **NFR2.2.2**: Attendance marking should provide immediate visual feedback.

### 2.3 Scalability
- **NFR2.3.1**: The system shall use managed services (MongoDB Atlas, AWS S3) to support horizontal scaling.
- **NFR2.3.2**: Node.js backend should be capable of running behind a Load Balancer if needed.

### 2.4 Reliability
- **NFR2.4.1**: The application shall use PM2 to ensure the backend process restarts automatically on failure.
- **NFR2.4.2**: Database backups are managed by MongoDB Atlas.
