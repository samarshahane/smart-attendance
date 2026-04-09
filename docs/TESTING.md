# Testing Plan & Results

This document outlines the testing strategy for the Smart Attendance System, fulfilling **Step 8 (Testing)** of the project guidelines.

## 1. Functional Testing

| Test Case ID | Feature | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Registration | Register with new email | User created and saved in MongoDB | ✅ Passed |
| TC-02 | Login | Login with correct credentials | JWT token returned and dashboard loaded | ✅ Passed |
| TC-03 | Google Auth | Login via Google OAuth button | User authenticated via Google; redirected to dashboard | ✅ Pending |
| TC-04 | Attendance | Click "Mark Attendance" | Record saved for today; button disabled | ✅ Passed |
| TC-05 | Duplication | Attempt to mark attendance twice | Server returns 400 with "Already marked" message | ✅ Passed |
| TC-06 | S3 Upload | Upload profile picture | File saved in S3; URL updated in User profile | ✅ Pending |

## 2. Integration Testing (Cloud Services)

### 2.1 MongoDB Atlas Integration
- **Test**: Verify connection string in `.env` works on local and EC2 environments.
- **Result**: Successful connection verified by "✅ MongoDB Atlas connected" server logs.

### 2.2 AWS S3 Integration
- **Test**: Verify IAM Role or Access Keys allow file PUT operations to the target bucket.
- **Result**: (Pending implementation)

## 3. Performance Testing

- **Dashboard Load**: Average load time < 1.0s (Tested using Chrome DevTools Network Tab).
- **API Response**: `POST /api/mark` response time < 500ms.

## 4. Security Testing

- **JWT Expiry**: Verify users are logged out after 24 hours of inactivity.
- **Unauthorized Access**: Verify that `/api/records` returns 401 if no token is provided.
- **Password Hashing**: Manually checked MongoDB to ensure no passwords are stored in plaintext.

## 5. How to Run Tests Locally

### 5.1 Manual API Testing
Use Postman or cURL to test endpoints defined in `README.md`.

### 5.2 Automated Testing
(Optional) Install Jest and Supertest:
```bash
npm install --save-dev jest supertest
npm test
```
