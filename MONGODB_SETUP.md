# MongoDB Setup Guide

## 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gpt_clone
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gpt_clone?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 2. Local MongoDB Setup

### Option A: Docker (Recommended)
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### Option B: MongoDB Community Edition
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. Create database: `gpt_clone`

## 3. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env.local`

## 4. Test Connection
Visit `/api/health` to check MongoDB connection status.

## 5. Database Collections
The app will automatically create:
- `conversations` - Stores chat conversations
- `files` - Stores uploaded file metadata

## 6. Troubleshooting
- Check MongoDB service is running
- Verify connection string format
- Check firewall/network settings
- Ensure proper authentication credentials

