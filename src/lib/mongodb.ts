import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gpt_clone'

let isConnected = false
let connectionAttempted = false

export async function connectDB(): Promise<typeof mongoose | null> {
  // If we've already tried to connect and failed, don't try again
  if (connectionAttempted && !isConnected) {
    console.log('⚠️ MongoDB connection previously failed, skipping retry')
    return null
  }

  if (isConnected) {
    return mongoose
  }

  connectionAttempted = true

  try {
    console.log('🔄 Connecting to MongoDB...')
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Reduced timeout
      socketTimeoutMS: 10000, // Reduced timeout
      family: 4
    }

    await mongoose.connect(MONGODB_URI, opts)
    
    isConnected = true
    console.log('✅ MongoDB connected successfully')
    
    return mongoose
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    isConnected = false
    console.log('⚠️ App will continue in offline mode')
    return null
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    try {
      await mongoose.disconnect()
      isConnected = false
      console.log('MongoDB disconnected')
    } catch (error) {
      console.error('Error disconnecting MongoDB:', error)
    }
  }
}

// Check connection status
export function isConnectedToDB(): boolean {
  return mongoose.connection.readyState === 1
}

// Get connection status
export function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown'
}

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB')
  isConnected = true
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
  isConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
  isConnected = false
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDB()
  process.exit(0)
})