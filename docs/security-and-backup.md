# Security and Backup

## Security Implementation

### Authentication Security

#### 1. User Authentication
```javascript
// NextAuth.js configuration
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      // Custom email/password authentication
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  }
}
```

#### 2. Password Security
```javascript
// Password hashing with bcrypt
const bcrypt = require('bcryptjs');

// Hash password before saving
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValidPassword = await bcrypt.compare(password, hashedPassword);
```

#### 3. Session Management
```javascript
// JWT token configuration
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

### API Security

#### 1. Rate Limiting
```javascript
// API rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

#### 2. Input Validation
```javascript
// Validate user input
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
];
```

#### 3. CORS Configuration
```javascript
// CORS settings
const corsOptions = {
  origin: ['https://jotatsu.com', 'https://www.jotatsu.com'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Database Security

#### 1. MongoDB Security
```javascript
// MongoDB connection with security
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};
```

#### 2. Data Encryption
```javascript
// Encrypt sensitive data
const crypto = require('crypto');

const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

#### 3. Query Security
```javascript
// Prevent NoSQL injection
const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, '');
};

// Use parameterized queries
const user = await User.findOne({ email: sanitizedEmail });
```

### File Upload Security

#### 1. File Validation
```javascript
// Validate file uploads
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

#### 2. S3 Security
```javascript
// S3 upload with security
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.mimetype,
    ACL: 'private' // Private by default
  };
  
  return await s3.upload(params).promise();
};
```

## Data Protection

### GDPR Compliance

#### 1. Data Collection
```javascript
// User consent tracking
const UserConsent = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  consentType: { type: String, required: true },
  granted: { type: Boolean, required: true },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null }
});
```

#### 2. Data Deletion
```javascript
// User data deletion
const deleteUserData = async (userId) => {
  try {
    // Delete user account
    await User.findByIdAndDelete(userId);
    
    // Delete user messages
    await Message.deleteMany({ sender: userId });
    
    // Delete user progress
    await Progress.deleteMany({ user: userId });
    
    // Delete user files from S3
    // Implementation for S3 file deletion
    
    return { success: true };
  } catch (error) {
    console.error('Data deletion error:', error);
    return { success: false, error: error.message };
  }
};
```

#### 3. Data Export
```javascript
// User data export
const exportUserData = async (userId) => {
  const user = await User.findById(userId);
  const messages = await Message.find({ sender: userId });
  const progress = await Progress.find({ user: userId });
  
  return {
    user: user,
    messages: messages,
    progress: progress,
    exportedAt: new Date()
  };
};
```

### Privacy Controls

#### 1. User Privacy Settings
```javascript
// Privacy settings schema
const PrivacySettings = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
  showOnlineStatus: { type: Boolean, default: true },
  allowFriendRequests: { type: Boolean, default: true },
  dataSharing: { type: Boolean, default: false }
});
```

#### 2. Data Anonymization
```javascript
// Anonymize user data
const anonymizeUserData = (userData) => {
  return {
    ...userData,
    email: 'anonymized@example.com',
    name: 'Anonymous User',
    personalInfo: null
  };
};
```

## Backup Strategy

### Database Backups

#### 1. MongoDB Atlas Backups
```bash
# Automated backups are enabled in MongoDB Atlas
# Backup frequency: Daily
# Retention period: 30 days
# Backup location: Same region as cluster
```

#### 2. Manual Backup Procedures
```bash
# Create manual backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/jotatsu-lms" --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/jotatsu-lms" ./backup

# Verify backup integrity
mongorestore --dryRun --uri="mongodb+srv://..." ./backup
```

#### 3. Backup Verification
```javascript
// Verify backup integrity
const verifyBackup = async (backupPath) => {
  try {
    const backupData = await fs.readFile(backupPath);
    const parsedData = JSON.parse(backupData);
    
    // Check data integrity
    const isValid = await validateBackupData(parsedData);
    return isValid;
  } catch (error) {
    console.error('Backup verification failed:', error);
    return false;
  }
};
```

### File Backups

#### 1. S3 Backup Strategy
```bash
# S3 versioning enabled
# Cross-region replication configured
# Lifecycle policies for cost optimization
```

#### 2. File Backup Procedures
```javascript
// Backup S3 files
const backupS3Files = async () => {
  const s3 = new AWS.S3();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: 'uploads/'
  };
  
  const objects = await s3.listObjectsV2(params).promise();
  
  for (const obj of objects.Contents) {
    // Copy to backup bucket
    await s3.copyObject({
      Bucket: process.env.AWS_S3_BACKUP_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${obj.Key}`,
      Key: obj.Key
    }).promise();
  }
};
```

### Code Backups

#### 1. Git Repository
```bash
# Regular commits to main branch
# Tag releases for version control
# Backup repository to external service
```

#### 2. Environment Backup
```bash
# Export environment variables
# Document configuration
# Version control configs
```

## Security Monitoring

### Logging and Monitoring

#### 1. Security Event Logging
```javascript
// Log security events
const logSecurityEvent = (event, userId, details) => {
  const securityLog = {
    event: event,
    userId: userId,
    details: details,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Store in security logs collection
  SecurityLog.create(securityLog);
};
```

#### 2. Failed Login Attempts
```javascript
// Track failed login attempts
const trackFailedLogin = async (email, ip) => {
  const attempt = {
    email: email,
    ip: ip,
    timestamp: new Date(),
    userAgent: req.get('User-Agent')
  };
  
  await FailedLogin.create(attempt);
  
  // Check for suspicious activity
  const recentAttempts = await FailedLogin.countDocuments({
    ip: ip,
    timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });
  
  if (recentAttempts > 5) {
    // Implement rate limiting or account lockout
    await lockAccount(email);
  }
};
```

### Intrusion Detection

#### 1. Suspicious Activity Detection
```javascript
// Detect suspicious patterns
const detectSuspiciousActivity = async (userId, activity) => {
  const recentActivities = await UserActivity.find({
    userId: userId,
    timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });
  
  // Check for unusual patterns
  if (recentActivities.length > 100) {
    await flagSuspiciousActivity(userId, activity);
  }
};
```

#### 2. IP Blocking
```javascript
// Block suspicious IPs
const blockSuspiciousIP = async (ip) => {
  await BlockedIP.create({
    ip: ip,
    reason: 'Suspicious activity',
    blockedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
};
```

## Incident Response

### Security Incident Procedures

#### 1. Incident Detection
```javascript
// Monitor for security incidents
const monitorSecurityIncidents = async () => {
  // Check for unusual login patterns
  // Monitor for data breaches
  // Track suspicious API usage
  // Alert on security events
};
```

#### 2. Incident Response Plan
```bash
# 1. Identify the incident
# 2. Assess the impact
# 3. Contain the threat
# 4. Eradicate the problem
# 5. Recover systems
# 6. Document lessons learned
```

### Data Breach Response

#### 1. Breach Detection
```javascript
// Detect potential data breaches
const detectDataBreach = async () => {
  // Monitor for unusual data access
  // Check for unauthorized downloads
  // Track suspicious user behavior
  // Alert on potential breaches
};
```

#### 2. Breach Response
```bash
# 1. Immediate containment
# 2. Assess affected data
# 3. Notify affected users
# 4. Report to authorities
# 5. Implement additional security
# 6. Monitor for further incidents
```

## Security Best Practices

### Development Security

#### 1. Secure Coding Practices
```javascript
// Use parameterized queries
// Validate all inputs
// Implement proper error handling
// Use HTTPS everywhere
// Implement proper authentication
```

#### 2. Code Review Process
```bash
# Review all code changes
# Check for security vulnerabilities
# Test authentication and authorization
# Verify input validation
# Review error handling
```

### Production Security

#### 1. Environment Security
```bash
# Use environment variables for secrets
# Implement proper access controls
# Monitor system access
# Regular security updates
# Implement logging and monitoring
```

#### 2. Network Security
```bash
# Use HTTPS everywhere
# Implement proper CORS
# Use secure headers
# Monitor network traffic
# Implement rate limiting
```

---

**Last Updated**: December 2024  
**Version**: 1.0.0
