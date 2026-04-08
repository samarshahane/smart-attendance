# ☁️ AWS Deployment Guide - Smart Attendance System
## Step-by-Step for Beginners

---

## 🏗️ STEP 1 — Create an AWS Account

1. Go to **https://aws.amazon.com**
2. Click **"Create an AWS Account"**
3. Enter your email address and a strong password
4. Choose **"Personal"** account type
5. Enter credit card (won't be charged for Free Tier)
6. Verify your identity (phone OTP)
7. Choose **Basic Support Plan (Free)**
8. You're in! Go to the **AWS Management Console**

> 💡 **Free Tier**: AWS gives you a **t2.micro EC2 instance FREE for 12 months!**

---

## 🖥️ STEP 2 — Launch EC2 Instance (Ubuntu Server)

1. In the AWS Console, search for **"EC2"** and click it
2. Click **"Launch Instance"** (orange button)
3. Fill in the settings:
   - **Name**: `smart-attendance-server`
   - **AMI**: Choose **"Ubuntu Server 22.04 LTS (HVM)"** (Free tier eligible)
   - **Instance Type**: Select **t2.micro** (Free tier eligible)
4. **Key Pair** (for SSH access):
   - Click **"Create new key pair"**
   - Name: `attendance-key`
   - Type: RSA
   - Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows with PuTTY)
   - Click **"Create key pair"** → It downloads automatically
   - **SAVE THIS FILE! You cannot download it again!**
5. **Network Settings** (Security Group):
   - Check ✅ "Allow SSH traffic from" → **Anywhere (0.0.0.0/0)**
   - Check ✅ "Allow HTTP traffic from the internet"
   - Check ✅ "Allow HTTPS traffic from the internet"
6. **Storage**: Leave default (8 GB) — Free tier
7. Click **"Launch Instance"**
8. Wait 1-2 minutes for the instance to start
9. Click on your instance ID → Note down the **Public IPv4 address** (e.g., `54.123.45.67`)

---

## 🔐 STEP 3 — Configure Security Group (Open Ports)

After launching, we need to open the port that Node.js runs on (5000).

1. In EC2 console, click your instance
2. Click the **"Security"** tab
3. Click on the Security Group link (e.g., `sg-0abc123`)
4. Click **"Edit inbound rules"**
5. Click **"Add Rule"**:
   - Type: **Custom TCP**
   - Port Range: **5000**
   - Source: **Anywhere-IPv4 (0.0.0.0/0)**
6. Click **"Save rules"**

You should now have these rules:
| Type       | Port  | Source    |
|------------|-------|-----------|
| SSH        | 22    | 0.0.0.0/0 |
| HTTP       | 80    | 0.0.0.0/0 |
| HTTPS      | 443   | 0.0.0.0/0 |
| Custom TCP | 5000  | 0.0.0.0/0 |

---

## 💻 STEP 4 — Connect to EC2 via SSH

### Option A: Using AWS Console (Easiest - No software needed!)
1. Go to EC2 → Select your instance
2. Click **"Connect"** button
3. Choose **"EC2 Instance Connect"** tab
4. Click **"Connect"** → A browser terminal opens!

### Option B: Using Windows PowerShell / Terminal
```bash
# Navigate to folder where your key file is saved
cd C:\Users\YourName\Downloads

# Connect (replace with your actual IP)
ssh -i "attendance-key.pem" ubuntu@54.123.45.67
```

### Option C: Using PuTTY (Windows)
1. Download PuTTY from putty.org
2. Open PuTTYgen → Load your .pem file → Save private key (.ppk)
3. Open PuTTY:
   - Host Name: `ubuntu@54.123.45.67`
   - Connection → SSH → Auth → Browse to your .ppk file
   - Click Open

> 🎉 You should see the Ubuntu terminal with `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

---

## 🛠️ STEP 5 — Install Required Software on EC2

Run these commands in the EC2 terminal (copy-paste one by one):

```bash
# Update system packages
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js (version 18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x

# Install Git
sudo apt-get install -y git

# Verify git
git --version
```

---

## 📦 STEP 6 — Upload Project to EC2 via GitHub

### On Your Local Computer First:

1. Create a GitHub account at **github.com** (if you don't have one)
2. Create a new repository called `smart-attendance-system`
3. Upload your project:

```bash
# Initialize git in your project folder
cd smart-attendance-system/backend
git init
git add .
git commit -m "Initial commit - Smart Attendance System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smart-attendance-system.git
git push -u origin main
```

### On EC2 Terminal:

```bash
# Clone your project
git clone https://github.com/YOUR-USERNAME/smart-attendance-system.git

# Go into the project
cd smart-attendance-system
```

---

## 🌿 STEP 7 — Set Up MongoDB Atlas (Cloud Database)

1. Go to **https://www.mongodb.com/atlas**
2. Sign up for a FREE account
3. Create a new project: **"AttendanceDB"**
4. Create a cluster:
   - Click **"Build a Database"**
   - Choose **FREE (Shared)** tier
   - Cloud Provider: AWS
   - Region: Choose nearest (e.g., Mumbai/Singapore)
   - Click **"Create"**
5. Set up access:
   - **Database Access** → Add New User:
     - Username: `attendanceUser`
     - Password: `YourStrongPassword123`
     - Role: Read and Write to any database
   - **Network Access** → Add IP Address:
     - Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
     - (For production, restrict to your EC2's IP)
6. Get connection string:
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://attendanceUser:YourStrongPassword123@cluster0.xxxxx.mongodb.net/attendanceDB
     ```

---

## ⚙️ STEP 8 — Configure Environment Variables on EC2

```bash
# Make sure you're in the project directory
cd smart-attendance-system

# Create the .env file
nano .env
```

In the nano editor, paste and edit:
```
MONGO_URI=mongodb+srv://attendanceUser:YourStrongPassword123@cluster0.xxxxx.mongodb.net/attendanceDB?retryWrites=true&w=majority
JWT_SECRET=MyUltraSecretVeryLongRandomKey2024AttendanceSystem
PORT=5000
```

Save and exit nano: Press `Ctrl+X`, then `Y`, then `Enter`

---

## 📥 STEP 9 — Install Dependencies and Run the Server

```bash
# Install all npm packages
npm install

# Test the server (temporary - will stop when you close terminal)
node server.js
```

You should see:
```
✅  MongoDB Atlas connected successfully!
🚀 Server is running on port 5000
📡 API Base URL: http://localhost:5000/api
🌐 Frontend:    http://localhost:5000
```

**Test in browser**: Open `http://YOUR-EC2-IP:5000`

---

## 🔄 STEP 10 — Keep Server Running with PM2 (Process Manager)

When you close the terminal, the server stops. PM2 keeps it running forever!

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your app with PM2
pm2 start server.js --name "attendance-app"

# Make it start automatically when EC2 reboots
pm2 startup
# Copy and run the command it shows you

pm2 save

# Check status
pm2 status

# View live logs
pm2 logs attendance-app

# Other useful PM2 commands:
pm2 restart attendance-app   # Restart the app
pm2 stop attendance-app      # Stop the app
pm2 delete attendance-app    # Remove from PM2
```

---

## 🌐 STEP 11 — Access Your Application

Open your browser and go to:
```
http://YOUR-EC2-PUBLIC-IP:5000
```

Example:
```
http://54.123.45.67:5000
```

✅ **Your Smart Attendance System is now live on AWS!**

---

## 🔍 Troubleshooting Common Issues

### "Connection Refused" Error
- Check if server is running: `pm2 status`
- Check port 5000 is open in Security Group
- Verify the EC2 public IP is correct

### "MongoDB Connection Failed"
- Double-check your MONGO_URI in .env
- Make sure MongoDB Atlas allows your EC2's IP
- Verify your Atlas username and password

### Server keeps stopping
- Use PM2: `pm2 start server.js --name "attendance-app"`

### Check server logs
```bash
pm2 logs attendance-app
# or
cat ~/.pm2/logs/attendance-app-error.log
```

---

## 📊 Final Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           USER'S BROWSER (Client)           │
│   HTML + CSS + JavaScript (Frontend)        │
└──────────────────┬──────────────────────────┘
                   │ HTTP Requests
                   │ (Port 5000)
                   ▼
┌─────────────────────────────────────────────┐
│         AWS EC2 (Ubuntu t2.micro)           │
│    Node.js + Express.js (Backend API)       │
│    PM2 Process Manager                      │
│    Public IP: 54.x.x.x                      │
└──────────────────┬──────────────────────────┘
                   │ MongoDB Connection String
                   │ (Port 27017, over internet)
                   ▼
┌─────────────────────────────────────────────┐
│         MongoDB Atlas (Cloud DBaaS)         │
│    Collections: users, attendances          │
│    Free Tier: 512MB storage                 │
└─────────────────────────────────────────────┘
```

---

## 💰 Cost Estimate

| Service        | Plan      | Monthly Cost |
|----------------|-----------|--------------|
| AWS EC2        | t2.micro  | **FREE** (12 months) |
| MongoDB Atlas  | M0 Shared | **FREE** (forever) |
| **Total**      |           | **₹0/month!** |

---

## 📝 Viva Questions & Answers

**Q: What is IaaS? How is EC2 an example?**
A: IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet. AWS EC2 lets us rent virtual machines (servers) without buying physical hardware.

**Q: What is DBaaS? How is MongoDB Atlas an example?**
A: DBaaS (Database as a Service) provides managed database hosting. MongoDB Atlas handles backups, scaling, and maintenance automatically.

**Q: Why do we use JWT?**
A: JWT (JSON Web Token) is a secure way to verify users without storing sessions on server. The token is signed with a secret key, so it can't be forged.

**Q: Why is bcrypt used for passwords?**
A: bcrypt is a one-way hashing algorithm. Even if the database is stolen, attackers cannot reverse-engineer the original passwords.

**Q: What is 3-tier architecture?**
A: 1) Presentation tier (browser frontend) 2) Logic tier (Node.js backend on EC2) 3) Data tier (MongoDB Atlas). Each tier has a specific role and can be scaled independently.

**Q: What are Security Groups?**
A: Security Groups are virtual firewalls in AWS that control inbound and outbound traffic to EC2 instances based on port rules.
