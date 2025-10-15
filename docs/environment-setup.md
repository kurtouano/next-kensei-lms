# Environment Setup

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Version 2.0.0 or higher
- **MongoDB**: Local installation or MongoDB Atlas account

### Recommended Tools
- **VS Code**: Code editor with extensions
- **MongoDB Compass**: Database management tool
- **Postman**: API testing tool

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone [repository-url]
cd next-kensei-lms

# Check if you're on the correct branch
git branch
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

### 4. Configure Environment Variables

Edit `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jotatsu-lms
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jotatsu-lms

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Pusher Configuration
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Email Configuration
EMAIL_SERVER_HOST=your-email-server
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-user
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email-address
```

## Development Commands

### Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### Build and Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Database Setup

### Local MongoDB Setup

1. **Install MongoDB locally**:
   ```bash
   # On macOS with Homebrew
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb
   
   # On Windows
   # Download from MongoDB website
   ```

2. **Start MongoDB service**:
   ```bash
   # On macOS/Linux
   brew services start mongodb-community
   # OR
   sudo systemctl start mongod
   
   # On Windows
   # Start MongoDB service from Services
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Get connection string**
4. **Update MONGODB_URI in .env.local**

## VS Code Setup

### Recommended Extensions

Install these VS Code extensions for better development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "typescript": "typescript"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

#### 2. MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Check connection string format
# Should be: mongodb://localhost:27017/database-name
```

#### 3. Environment Variables Not Loading
```bash
# Restart the development server
npm run dev

# Check if .env.local exists
ls -la .env.local
```

#### 4. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Use turbo mode (if available)
npm run dev --turbo

# Or increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

#### 2. Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Development Workflow

### 1. Daily Development
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Make changes to code
# Hot reload will automatically update
```

### 2. Testing Changes
```bash
# Run linting
npm run lint

# Build to check for errors
npm run build

# Test production build locally
npm start
```

### 3. Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

## Environment-Specific Configurations

### Development Environment
- Hot reload enabled
- Detailed error messages
- Source maps enabled
- Debug logging enabled

### Production Environment
- Optimized builds
- Minified code
- Error tracking
- Performance monitoring

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [MongoDB Community](https://community.mongodb.com)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
