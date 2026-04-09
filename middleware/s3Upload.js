// ============================================================
// AWS S3 UPLOAD MIDDLEWARE
// ============================================================
// This middleware handles file uploads from the frontend
// and pipes them directly to your AWS S3 bucket.
// ============================================================

const { S3Client } = require('@aws-sdk/client-s3');
const multer       = require('multer');
const multerS3     = require('multer-s3');
const path         = require('path');

// 1. Initialize S3 Client
// In professional apps, we use IAM Roles if on EC2, 
// OR access keys from .env if on local development.
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// 2. Configure Multer-S3 Storage ENGINE
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || 'smart-attendance-profile-pics',
    acl: 'public-read', // Makes the file URL accessible by users
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect file type
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique filename: profile-pics/userId-timestamp.jpg
      const userId = req.user ? req.user.userId : 'anonymous';
      const ext    = path.extname(file.originalname);
      cb(null, `profile-pics/${userId}-${Date.now()}${ext}`);
    }
  }),
  // 3. Validation: Allow only images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed!'), false);
    }
  },
  // 4. Limitation: Max 5MB
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
