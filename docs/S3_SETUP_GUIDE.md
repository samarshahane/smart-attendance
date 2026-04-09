# AWS S3 Setup Guide

Follow these steps to set up an S3 bucket for the Smart Attendance System profile pictures.

## 1. Create the S3 Bucket

1. Log in to the **AWS Management Console**.
2. Search for **S3** and click **Create bucket**.
3. **Bucket name**: `smart-attendance-profile-pics` (or any unique name).
4. **AWS Region**: Select the same region as your EC2 (e.g., `ap-south-1`).
5. **Object Ownership**: ACLs enabled (recommended for simple public URL access).
6. **Block Public Access settings for this bucket**: 
   - Uncheck **Block all public access** (so profiles are visible to users).
   - Check the acknowledgement.
7. Click **Create bucket**.

## 2. Set Bucket Policy (Public Read)

To allow the app to display images to browsers:
1. Go to your bucket → **Permissions** tab → **Bucket policy**.
2. Click **Edit** and paste:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicRead",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
           }
       ]
   }
   ```
   *(Replace `YOUR_BUCKET_NAME` with your actual bucket name)*

## 3. Create IAM User (for Credentials)

If you are not using IAM Roles for EC2, you need an IAM user:
1. Search for **IAM** → **Users** → **Create user**.
2. Name: `attendance-s3-user`.
3. In **Permissions**, select **Attach policies directly**.
4. Search for `AmazonS3FullAccess` and select it.
5. Create user.
6. Click the user → **Security credentials** tab.
7. **Create access key** → Select **Command Line Interface (CLI)**.
8. **Save the Access Key ID and Secret Access Key!**

## 4. Update the `.env` File

Add these to your `.env` on local or EC2:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=smart-attendance-profile-pics
```

> [!TIP]
> **Best Practice**: If running on EC2, instead of using `.env` keys, attach an **IAM Role** with S3 permissions to the EC2 instance. The AWS SDK will automatically detect it!
