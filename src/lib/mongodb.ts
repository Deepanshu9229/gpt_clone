import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    return mongoose
  }

  try {
    console.log('🔄 Connecting to MongoDB...')
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    }

    await mongoose.connect(MONGODB_URI as string, opts)
    
    isConnected = true
    console.log('✅ MongoDB connected successfully')
    return mongoose
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

// Handle connection events
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