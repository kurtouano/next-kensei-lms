# Deployment Guide

## Overview

This guide covers deploying the Jotatsu LMS application to production using Vercel, including domain setup, environment configuration, and monitoring.

## Production Deployment

### 1. Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository connected
- Environment variables configured

#### Deployment Steps

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Set the following in Vercel dashboard:
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_URL=https://jotatsu.com
   NEXTAUTH_SECRET=your-production-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   PUSHER_APP_ID=your-pusher-app-id
   PUSHER_SECRET=your-pusher-secret
   NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
   NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=your-aws-region
   AWS_S3_BUCKET_NAME=your-s3-bucket-name
   ```

### 2. Domain Configuration

#### Squarespace Domain Setup

1. **Access Squarespace Domain Settings**
   - Login to Squarespace account
   - Navigate to Settings > Domains
   - Select jotatsu.com domain

2. **Configure DNS Records**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Ensure HTTPS is enforced
   - Check certificate status in Vercel dashboard

### 3. Database Configuration

#### MongoDB Atlas Production Setup

1. **Create Production Cluster**
   - Choose appropriate tier (M10 or higher)
   - Select region closest to your users
   - Enable backup and monitoring

2. **Network Access**
   - Add Vercel IP ranges to whitelist
   - Or allow access from anywhere (0.0.0.0/0) for simplicity

3. **Database User**
   - Create dedicated user for application
   - Use strong password
   - Grant appropriate permissions

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/jotatsu-lms?retryWrites=true&w=majority
   ```

### 4. File Storage Setup

#### Amazon S3 Configuration

1. **Create S3 Bucket**
   ```bash
   # Bucket name: jotatsu-lms-files
   # Region: us-east-1 (or your preferred region)
   # Versioning: Enabled
   # Encryption: Enabled
   ```

2. **Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::jotatsu-lms-files/*"
       }
     ]
   }
   ```

3. **CORS Configuration**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://jotatsu.com"],
       "ExposeHeaders": []
     }
   ]
   ```

#### CloudFront CDN Setup

1. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Price class: Use all edge locations

2. **Custom Domain**
   - Add cdn.jotatsu.com as alternate domain
   - Upload SSL certificate
   - Configure DNS record

### 5. Real-time Services

#### Pusher Configuration

1. **Create Pusher App**
   - App name: Jotatsu LMS
   - Cluster: Choose closest to your users
   - Enable client events if needed

2. **Webhook Setup**
   - Configure webhook endpoints
   - Set up authentication
   - Test webhook delivery

### 6. Payment Integration

#### Stripe Configuration

1. **Webhook Endpoints**
   ```
   Endpoint URL: https://jotatsu.com/api/webhooks/stripe
   Events: payment_intent.succeeded, customer.subscription.updated
   ```

2. **Test Mode vs Live Mode**
   - Use test mode during development
   - Switch to live mode for production
   - Update webhook endpoints accordingly

## Monitoring and Analytics

### 1. Vercel Analytics

1. **Enable Vercel Analytics**
   - Go to Vercel dashboard
   - Navigate to Analytics tab
   - Enable for your project

2. **Core Web Vitals**
   - Monitor LCP, FID, CLS
   - Set up alerts for performance issues
   - Regular performance reviews

### 2. Error Tracking

1. **Sentry Integration** (Optional)
   ```bash
   npm install @sentry/nextjs
   ```

2. **Custom Error Logging**
   - Implement error boundaries
   - Log errors to external service
   - Set up error notifications

### 3. Uptime Monitoring

1. **Uptime Robot** (Recommended)
   - Monitor https://jotatsu.com
   - Set up alerts for downtime
   - Monitor response times

2. **Vercel Monitoring**
   - Built-in monitoring
   - Function execution metrics
   - Performance insights

## Security Configuration

### 1. Environment Security

1. **Secrets Management**
   - Use Vercel environment variables
   - Never commit secrets to repository
   - Rotate secrets regularly

2. **API Security**
   - Implement rate limiting
   - Use HTTPS everywhere
   - Validate all inputs

### 2. Database Security

1. **MongoDB Security**
   - Enable authentication
   - Use strong passwords
   - Regular security updates

2. **Network Security**
   - Restrict database access
   - Use VPN if needed
   - Monitor access logs

## Performance Optimization

### 1. Build Optimization

1. **Next.js Configuration**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
     images: {
       domains: ['your-s3-bucket.s3.amazonaws.com'],
       formats: ['image/webp', 'image/avif'],
     },
   }
   ```

2. **Image Optimization**
   - Use Next.js Image component
   - Implement lazy loading
   - Optimize image formats

### 2. CDN Configuration

1. **CloudFront Optimization**
   - Configure caching headers
   - Set up compression
   - Optimize TTL values

2. **Static Assets**
   - Serve static files from CDN
   - Implement cache busting
   - Monitor cache hit rates

## Backup and Recovery

### 1. Database Backups

1. **MongoDB Atlas Backups**
   - Enable automated backups
   - Set retention period
   - Test restore procedures

2. **Manual Backups**
   ```bash
   # Create database backup
   mongodump --uri="mongodb+srv://..." --out=./backup
   
   # Restore from backup
   mongorestore --uri="mongodb+srv://..." ./backup
   ```

### 2. Code Backups

1. **Git Repository**
   - Regular commits
   - Tag releases
   - Backup repository

2. **Environment Backup**
   - Export environment variables
   - Document configurations
   - Version control configs

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel
   # Verify all dependencies
   # Check TypeScript errors
   ```

2. **Environment Variables**
   ```bash
   # Verify all required variables are set
   # Check variable names and values
   # Test in development first
   ```

3. **Database Connection**
   ```bash
   # Test MongoDB connection
   # Check network access
   # Verify connection string
   ```

### Performance Issues

1. **Slow Loading**
   - Check Core Web Vitals
   - Optimize images
   - Implement caching

2. **Database Performance**
   - Monitor query performance
   - Add database indexes
   - Optimize queries

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check error logs
   - Monitor performance
   - Review security alerts

2. **Monthly**
   - Update dependencies
   - Review costs
   - Backup verification

3. **Quarterly**
   - Security audit
   - Performance review
   - Disaster recovery test

---

**Last Updated**: December 2024  
**Version**: 1.0.0
