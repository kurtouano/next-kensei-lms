# Paid Services and Licenses

## Domain & Hosting

### Domain Registration
- **Provider**: Squarespace
- **Domain**: jotatsu.com
- **Renewal**: Annual
- **Cost**: $20/year (estimated)
- **Status**: Active
- **Renewal**: July 27, 2026

### Web Hosting
- **Provider**: Vercel
- **Plan**: Free Plan (currently)
- **Current Cost**: FREE (Forever if maintained within limits)
- **Upgrade Cost**: $20/month (Pro Plan)
- **Limits**: 
  - 100GB bandwidth/month (exceeding triggers upgrade requirement)
  - 100GB-hours serverless function execution (shared across all functions)
  - 6,000 build minutes/month (includes all deployments and previews)
  - Cold starts (1-3 sec delay on first request)
  - Limited analytics data retention

## Database Services

### MongoDB Atlas
- **Provider**: MongoDB Atlas
- **Plan**: Free Tier (currently) / Flex / Dedicated (M10+ for production)
- **Current Cost**: FREE (Forever if maintained within limits)
- **Upgrade Options**:
  - **Flex Plan**: $0.011/hour (~$8/month) - 5GB storage, shared resources
  - **Dedicated M10**: $0.08/hour (~$57/month) - 10GB storage, dedicated resources
- **Current Limits** (Free Tier):
  - 512MB storage limit (exceeding requires upgrade)
  - Shared RAM and vCPU (not dedicated)
  - Up to 100 operations per second
  - Limited monitoring (basic metrics only)
  - No advanced security features

## Cloud Services

### Amazon Web Services (AWS)

#### Amazon S3 (File Storage)
- **Service**: Amazon S3
- **Plan**: Free Tier (Plan Expiration: May 2026)
- **Current Cost**: FREE (5GB storage, 20K GET requests, 2K PUT requests)
- **Upgrade Cost**: $0.025/GB/month + requests (when free tier exceeded)
- **Usage**: File uploads, images, documents

#### Amazon CloudFront (CDN)
- **Service**: Amazon CloudFront
- **Plan**: Free Tier (forever)
- **Current Cost**: FREE (50GB data transfer, 2M requests/month)
- **Upgrade Cost**: $0.085/GB + $0.0075 per 10K requests (when free tier exceeded)
- **Usage**: Global content delivery
- **Features**:
  - Global edge locations
  - SSL/TLS encryption
  - Cache optimization

## Real-time Services

### Pusher
- **Provider**: Pusher
- **Plan**: Free Plan (currently)
- **Current Cost**: FREE (Forever if maintained within limits)
- **Upgrade Cost**: $49/month (Standard Plan)
- **Current Limits**:
  - 100 concurrent users limit (exceeding requires upgrade)
  - 200,000 message limit per day (resets at midnight UTC)
  - 1 channel limit (single channel for all communications)
  - No private channels (all channels are public)
- **Usage**: Real-time notifications for chat, notifications, and users counters in header
- **Features**:
  - Real-time notifications
  - WebSocket support
  - Used in 3 icons in header (chat, notif, and users) for counters

## Payment Processing

### Stripe
- **Provider**: Stripe
- **Cost**: 2.9% + 30¢ per transaction
- **Features**:
  - Payment processing
  - Subscription management
  - Webhook handling
  - Fraud protection

## Email Services

### Email Provider
- **Provider**: Resend
- **Plan**: Free Tier (currently)
- **Current Cost**: FREE (3,000 transactional emails/month, 1,000 marketing contacts)
- **Upgrade Cost**: $20/month (Pro Plan - 50,000 emails) / $40/month (Pro Marketing - 5,000 contacts)
- **Features**:
  - Transactional emails
  - Newsletter sending
  - Email templates
  - Analytics

## SSL & Security

### SSL Certificates
- **Provider**: Vercel (included)
- **Cost**: Free
- **Features**: Automatic SSL/TLS certificates

## Monitoring & Analytics

### Performance Monitoring
- **Provider**: Vercel Analytics + Google Search Console
- **Cost**: Free (both services)
- **Features**: 
  - Core Web Vitals, performance metrics (Vercel)
  - Search performance, indexing status (Google Search Console)
  - SEO insights and recommendations

### Error Tracking
- **Provider**: Vercel Analytics + Google Search Console
- **Cost**: Free (both services)
- **Features**: 
  - Error logging and monitoring (Vercel)
  - Search console errors (Google)
  - Real-time error notifications

## Current vs Future Costs

### Current Monthly Costs (Free Tier)
| Service | Current Cost | Status |
|---------|-------------|---------|
| Vercel | FREE | Free forever if within limits |
| Pusher | FREE | Free forever if within limits |
| MongoDB Atlas | FREE | Free tier (512MB, shared resources) |
| Amazon S3 | FREE | Free tier (5GB, 20K GET, 2K PUT) |
| Amazon CloudFront | FREE | Free tier (50GB, 2M requests) |
| Resend | FREE | Free tier (3K emails, 1K contacts) |
| **Current Total** | **FREE** | **Per month** |

### Future Upgrade Costs (When Needed)
| Likelihood | Service | Upgrade Cost | When to Upgrade |
|-----------|---------|-------------|-----------------|
| **HIGH** | Vercel Pro | $20/month | When free limits exceeded |
| **HIGH** | MongoDB Atlas Flex | $8/month | When free tier limits exceeded |
| **HIGH** | Amazon S3 | ~$1/month ($0.025/GB) | When 5GB free tier exceeded (50GB usage) |
| **MEDIUM** | Pusher Standard | $49/month | When 100 concurrent users exceeded |
| **MEDIUM** | Amazon CloudFront | ~$1/month ($0.085/GB) | When 50GB free tier exceeded (10GB usage) |
| **LOW** | Resend Pro | $20/month | When 3K emails exceeded |
| **Future Total** | **$30-99/month** | **When scaling needed** |
