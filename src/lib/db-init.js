// Create this file at: src/lib/db-init.ts

import { connectDB } from './mongodb'
import { Conversation } from '../models/Conversation'

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...')
    
    // Connect to MongoDB
    await connectDB()
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...')
    
    // Conversation indexes
    await Conversation.createIndexes()
    
    console.log('✅ Database indexes created successfully')
    console.log('✅ Database initialization complete')
    
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Test database connection and create indexes
export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    const connection = await connectDB()
    const db = connection.connection.db

    if (!db) {
      throw new Error('Database connection is undefined');
    }

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));

    // Test basic operations
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Database connection test successful'
    })
    
    await testCollection.deleteOne({ test: true })
    console.log('✅ Database operations test successful')
    
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}