# Jotatsu LMS

A comprehensive Learning Management System focused on Japanese language learning with gamification elements and social features.

## 🌟 Overview

Jotatsu is a comprehensive Learning Management System (LMS) designed specifically for Japanese language learning. The platform combines structured educational content with modern gamification elements, creating an engaging and interactive learning experience. It features interactive courses with video lessons, downloadable resources, and quizzes, all enhanced by a unique customizable Bonsai tree progression system that grows with your learning journey. The platform also includes social features like real-time chat, friend systems, and instructor tools for course creation and student management.

**Live Website**: [jotatsu.com](https://jotatsu.com)

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd next-kensei-lms
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```bash
   # Environment
   NODE_ENV=test
   # For localhost/local development: use "test"
   # For production: use "production"

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Pusher (Real-time)
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

   # AWS S3 & CloudFront
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   AWS_CLOUDFRONT_DOMAIN_NAME=your_cloudfront_domain

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Resend (Email)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

**📁 Open the `/docs` folder to view detailed documentation with proper formatting**

For comprehensive documentation, please navigate to the `/docs` folder where you'll find:

- **[Features & Modules](./docs/features-and-modules.md)** - Detailed feature descriptions and technical implementation
- **[Stack & Dependencies](./docs/stack-and-dependencies.md)** - Complete technical stack and package information
- **[Paid Services & Licenses](./docs/paid-services-and-licenses.md)** - Service costs, renewals, and credential management
- **[Instructor Guide](./docs/instructor-guide.md)** - Course creation and content management guide
- **[Compression Guidelines](./docs/compression-guidelines.md)** - File size limits and optimization requirements

> **💡 Tip**: For best viewing experience, open these files in GitHub, VS Code, or any Markdown viewer to see proper formatting instead of raw Markdown text.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB
- **Deployment**: Vercel
- **Domain**: Squarespace
- **CDN**: Amazon CloudFront
- **Storage**: Amazon S3
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Email Service**: Resend
- **Real-time**: Pusher, SSE, Polling

## 📋 Key Features

- 🎌 **Interactive Japanese Courses** - Video lessons, resources, exercises, and structured content
- 🌳 **Bonsai Tree Progression** - Visual growth system that reflects learning progress
- 💬 **Real-time Chat** - Instant messaging with friends and study groups
- 🏆 **Certificate System** - Automated PDF generation upon course completion
- 📝 **Blog System** - Featured articles and educational content
- 👨‍🏫 **Instructor Dashboard** - Course creation and student management tools
- 🔔 **Real-time Notifications** - Instant updates via Pusher
- 👥 **Social Features** - Friend system and collaborative learning spaces

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📞 Support

For support and questions:

- **Email**: [kurt.ouano@gmail.com](mailto:kurt.ouano@gmail.com)
- **Documentation**: See `/docs` folder for detailed guides
- **Issues**: Report bugs or feature requests through GitHub issues

## 📄 License

This project is proprietary software. All rights reserved.

---
