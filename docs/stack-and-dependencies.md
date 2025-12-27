# Stack and Dependencies

## Core Framework

### Frontend Framework

- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks and functional components
- **TypeScript**: Type safety and better development experience

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styling
- **Responsive Design**: Mobile-first approach

## Backend & API

### Server-Side

- **Node.js**: JavaScript runtime
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling

### Authentication

- **NextAuth.js**: Authentication framework
- **Google OAuth**: Social login integration
- **JWT**: JSON Web Tokens for session management

## Database & Storage

### Database

- **MongoDB Atlas**: Cloud-hosted MongoDB
- **Mongoose ODM**: Object Document Mapper

### File Storage

- **Amazon S3**: File storage and management
- **Amazon CloudFront**: CDN for static assets
- **Image Compression**: Optimized image delivery

## Real-time Features

### WebSocket & Real-time

- **Pusher**: Real-time notifications and updates
- **Server-Sent Events (SSE)**: Real-time data streaming
- **Polling System**: Chat message synchronization

## External Services

### Payment Processing

- **Stripe**: Payment processing and subscriptions
- **Webhook Integration**: Payment event handling

### Email Services

- **Email Integration**: User notifications and updates
- **SMTP Configuration**: Email delivery through Resend

### Analytics & Monitoring

- **Performance Monitoring**: Application performance tracking
- **Error Tracking**: Error logging and monitoring

## Development Tools

### Version Control

- **Git**: Version control system
- **GitHub**: Repository hosting and collaboration

## Deployment & Hosting

### Production Environment

- **Vercel**: Hosting and deployment platform
- **Domain**: Squarespace domain management
- **SSL**: Automatic HTTPS certificates

### Environment Management

#### Environment Variables

All environment variables should be defined in a `.env` file in the root directory. For production deployments (e.g., Vercel), set these in your deployment platform's environment variable settings.

##### Required Variables

**NODE_ENV**

- **Description**: Defines the application environment
- **Values**: `test` (for localhost/local development), `production` (for production)
- **Where to get**: Set manually in `.env` file
- **Notes**: Next.js sets this automatically, but you can override it. Use `test` for local development, `production` for deployed environments.

**MONGODB_URI**

- **Description**: MongoDB database connection string
- **Where to get**: MongoDB Atlas dashboard → Connect → Connection String
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Required**: Yes
- **Notes**: Create a MongoDB Atlas account and cluster if you don't have one.

**NEXTAUTH_URL**

- **Description**: Base URL of your application for NextAuth callbacks
- **Local**: `http://localhost:3000`
- **Production**: Your production domain (e.g., `https://jotatsu.com`)
- **Required**: Yes
- **Notes**: Must match your actual domain in production.

**NEXTAUTH_SECRET**

- **Description**: Secret key for encrypting NextAuth session tokens
- **Where to get**: Generate using `openssl rand -base64 32` or any secure random string generator
- **Required**: Yes
- **Notes**: Keep this secret and never commit it to version control.

**GOOGLE_CLIENT_ID**

- **Description**: Google OAuth 2.0 Client ID for authentication
- **Where to get**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID
- **Required**: Yes (if using Google OAuth)
- **Notes**: Configure authorized redirect URIs: `{NEXTAUTH_URL}/api/auth/callback/google`

**GOOGLE_CLIENT_SECRET**

- **Description**: Google OAuth 2.0 Client Secret
- **Where to get**: Same as GOOGLE_CLIENT_ID (shown when creating OAuth client)
- **Required**: Yes (if using Google OAuth)
- **Notes**: Keep this secret and never commit it to version control.

**PUSHER_APP_ID**

- **Description**: Pusher application ID for real-time features
- **Where to get**: [Pusher Dashboard](https://dashboard.pusher.com/) → Your App → App Keys
- **Required**: Yes (if using real-time features)
- **Notes**: Used for backend Pusher instance.

**PUSHER_KEY**

- **Description**: Pusher application key (backend)
- **Where to get**: Pusher Dashboard → App Keys
- **Required**: Yes (if using real-time features)
- **Notes**: This is the backend key, different from the public key.

**PUSHER_SECRET**

- **Description**: Pusher application secret for backend authentication
- **Where to get**: Pusher Dashboard → App Keys
- **Required**: Yes (if using real-time features)
- **Notes**: Keep this secret and never commit it to version control.

**PUSHER_CLUSTER**

- **Description**: Pusher cluster region (e.g., `us2`, `eu`, `ap1`)
- **Where to get**: Pusher Dashboard → App Settings
- **Required**: Yes (if using real-time features)
- **Notes**: Should match your app's region for best performance.

**NEXT_PUBLIC_PUSHER_KEY**

- **Description**: Pusher public key for client-side connections
- **Where to get**: Pusher Dashboard → App Keys
- **Required**: Yes (if using real-time features)
- **Notes**: This is safe to expose in client-side code (prefixed with `NEXT_PUBLIC_`).

**NEXT_PUBLIC_PUSHER_CLUSTER**

- **Description**: Pusher cluster for client-side (same as PUSHER_CLUSTER)
- **Where to get**: Same as PUSHER_CLUSTER
- **Required**: Yes (if using real-time features)
- **Notes**: Must match PUSHER_CLUSTER value.

**AWS_REGION**

- **Description**: AWS region where your S3 bucket is located
- **Values**: `us-east-1`, `us-west-2`, `eu-west-1`, etc.
- **Where to get**: AWS Console → S3 → Your bucket → Properties → Region
- **Required**: Yes (if using AWS S3)
- **Notes**: Defaults to `us-east-1` if not specified in some routes.

**AWS_ACCESS_KEY_ID**

- **Description**: AWS IAM access key ID for S3 access
- **Where to get**: AWS Console → IAM → Users → Your user → Security credentials → Create access key
- **Required**: Yes (if using AWS S3)
- **Notes**: Create a user with S3 read/write permissions. Keep this secret.

**AWS_SECRET_ACCESS_KEY**

- **Description**: AWS IAM secret access key
- **Where to get**: Same as AWS_ACCESS_KEY_ID (shown only once when creating)
- **Required**: Yes (if using AWS S3)
- **Notes**: Keep this secret and never commit it to version control. Store securely.

**AWS_S3_BUCKET_NAME**

- **Description**: Name of your AWS S3 bucket for file storage
- **Where to get**: AWS Console → S3 → Your bucket name
- **Required**: Yes (if using AWS S3)
- **Notes**: Bucket must exist and have proper permissions configured.

**AWS_CLOUDFRONT_DOMAIN_NAME**

- **Description**: CloudFront distribution domain for CDN access
- **Where to get**: AWS Console → CloudFront → Your distribution → Domain name
- **Format**: `https://d1234567890.cloudfront.net` or your custom domain
- **Required**: Optional (falls back to S3 direct URLs if not set)
- **Notes**: Recommended for production to use CDN instead of direct S3 access.

**STRIPE_SECRET_KEY**

- **Description**: Stripe secret API key for payment processing
- **Where to get**: [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → API keys → Secret key
- **Format**: `sk_test_...` (test mode) or `sk_live_...` (live mode)
- **Required**: Yes (if using Stripe payments)
- **Notes**: Use test keys for development, live keys for production. Keep this secret.

**RESEND_API_KEY**

- **Description**: Resend API key for sending emails
- **Where to get**: [Resend Dashboard](https://resend.com/api-keys) → Create API Key
  - **Required**: Yes (if using email features)
  - **Notes**: Used for email verification, password reset, blog subscriptions, and notifications.

## Package Dependencies

For the complete and up-to-date list of all dependencies, see [`package.json`](../package.json) in the root directory. The package.json file is the authoritative source for all dependencies and their versions.
