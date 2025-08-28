# GPT Clone with MongoDB Integration

A modern ChatGPT clone built with Next.js, featuring full MongoDB integration for conversations and messages with optimistic updates.

## ✨ Features

- **Full MongoDB Integration**: Complete CRUD operations for conversations and messages
- **Optimistic Updates**: Instant UI updates with automatic rollback on errors
- **Real-time Chat**: Smooth chat experience with loading states
- **File Upload Support**: Attach and process various file types
- **Authentication**: Clerk-based user authentication
- **Responsive Design**: Modern, mobile-friendly UI
- **Error Handling**: Comprehensive error handling with retry mechanisms

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Clerk account for authentication

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gpt_clone.3

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### 3. Environment Configuration

Create a `.env.local` file with your configuration:

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

### 4. MongoDB Setup

#### Option A: Local MongoDB with Docker (Recommended)

```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Check if it's running
docker ps
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 5. Database Initialization

```bash
# Test MongoDB connection
npm run db:test

# Initialize database and create indexes
npm run db:init
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## 🗄️ Database Schema

### Conversations Collection

```typescript
interface IConversation {
  userId: string          // Clerk user ID
  title: string          // Conversation title
  messages: IMessage[]    // Array of messages
  model: string          // AI model used (gpt-4, gpt-3.5, claude)
  createdAt: Date        // Creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

### Messages Collection (Embedded in Conversations)

```typescript
interface IMessage {
  id: string             // Unique message ID
  role: 'user' | 'assistant' | 'system'
  content: string        // Message content
  timestamp: Date        // Message timestamp
  edited: boolean        // Edit flag
  attachments?: Array    // File attachments
}
```

## 🔧 API Endpoints

### Conversations

- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get specific conversation
- `PUT /api/conversations/[id]` - Update conversation
- `DELETE /api/conversations/[id]` - Delete conversation

### Messages

- `POST /api/conversations/[id]/messages` - Add message to conversation
- `PUT /api/conversations/[id]/messages` - Update message

### Health Check

- `GET /api/health` - Check MongoDB connection status

## 🎯 Key Features Explained

### Optimistic Updates

The app uses optimistic updates for better UX:

1. **Immediate UI Update**: Changes appear instantly
2. **Background Sync**: Data is saved to MongoDB
3. **Automatic Rollback**: Failed operations revert the UI
4. **Error Handling**: User-friendly error messages with retry options

### MongoDB Integration

- **Connection Pooling**: Efficient database connections
- **Indexes**: Optimized queries for better performance
- **Error Handling**: Comprehensive error handling for database operations
- **Validation**: Input validation and sanitization

### Real-time Features

- **Live Updates**: Messages appear instantly
- **Loading States**: Visual feedback during operations
- **Error Recovery**: Automatic retry mechanisms
- **Offline Support**: Graceful degradation when offline

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Test connection
npm run db:test

# Check environment variables
cat .env.local
```

#### API 500 Errors

1. Check MongoDB connection: `npm run db:test`
2. Verify environment variables
3. Check browser console for detailed errors
4. Ensure Clerk authentication is configured

#### Performance Issues

1. Check database indexes: `npm run db:init`
2. Monitor MongoDB performance
3. Check network connectivity
4. Verify connection pool settings

### Debug Mode

Enable detailed error messages in development:

```bash
# Set environment variable
NODE_ENV=development npm run dev
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── conversations/ # Conversation endpoints
│   │   ├── files/         # File processing
│   │   └── health/        # Health check
│   └── page.tsx           # Main page
├── components/             # React components
│   ├── chat-area.tsx      # Main chat interface
│   ├── chat-provider.tsx  # Chat state management
│   └── ui/                # UI components
├── lib/                    # Utilities
│   ├── mongodb.ts         # Database connection
│   └── db-init.ts         # Database initialization
└── models/                 # Mongoose models
    └── Conversation.ts     # Conversation schema
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t gpt-clone .

# Run container
docker run -p 3000:3000 gpt-clone
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the [troubleshooting section](#troubleshooting)
- Review [MongoDB documentation](https://docs.mongodb.com/)
- Check [Next.js documentation](https://nextjs.org/docs)
- Open an issue for bugs or feature requests

---

**Happy coding! 🎉**
