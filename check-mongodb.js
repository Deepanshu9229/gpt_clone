const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('Please create a .env.local file with MONGODB_URI');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('✅ Database write test successful');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Database cleanup successful');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check if MongoDB is running on the correct port');
      console.log('3. For Docker: docker run -d --name mongodb -p 27017:27017 mongo:latest');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication failed. Check your username/password in MONGODB_URI');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Host not found. Check your MONGODB_URI format');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testConnection();
