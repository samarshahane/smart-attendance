# 🍃 MongoDB Atlas Setup Guide

Follow these steps to create your own free cloud database for the Smart Attendance System.

---

## 1. Create a Free Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up with your email or Google account.

## 2. Deploy a Free Cluster
1. Click **Create** to deploy a new database.
2. Select the **M0** (Free) tier.
3. **Provider**: AWS.
4. **Region**: Choose the one closest to you (e.g., Mumbai `ap-south-1`).
5. Click **Create Deployment**.

## 3. Configure Database Security (User)
1. In the **Security Quickstart**, create a **Database User**.
2. **Username**: e.g., `admin`.
3. **Password**: Click **Autogenerate Secure Password** and **COPY IT IMMEDIATELY**. You will need this for your `.env` file.
4. Click **Create Database User**.

## 4. Configure Network Access (IP Whitelist)
1. Go to **Network Access** in the left sidebar.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`).
4. Click **Confirm**. 
   > [!IMPORTANT]
   > This is required so that your AWS EC2 server can connect to your database.

## 5. Get the Connection URI
1. Go back to **Database** in the sidebar.
2. Click **Connect** on your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.xxxx.mongodb.net/...`

## 6. Update your Server
1. Open your terminal (SSH into EC2).
2. Edit your env file: `nano .env`.
3. Update the `MONGO_URI` with your new string.
   > [!CAUTION]
   > Make sure to manually replace `<password>` with the password you copied in Step 3!

4. Restart your application:
   ```bash
   pm2 restart attendance-app
   ```
