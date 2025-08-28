const fs = require('fs');
const path = require('path');

console.log('=== Environment Setup ===');

// Check if .env.local exists
const envLocalPath = '.env.local';
if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local already exists');
    const content = fs.readFileSync(envLocalPath, 'utf8');
    if (content.includes('MONGODB_URI')) {
        console.log('✅ MONGODB_URI is configured');
    } else {
        console.log('❌ MONGODB_URI is missing from .env.local');
    }
} else {
    console.log('❌ .env.local not found');
    console.log('\n📝 Creating .env.local with default values...');
    
    const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/gpt_clone

# Clerk Authentication (replace with your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
CLERK_SECRET_KEY=your_clerk_secret_here

# Environment
NODE_ENV=development
`;
    
    try {
        fs.writeFileSync(envLocalPath, envContent);
        console.log('✅ .env.local created successfully');
        console.log('⚠️  Please update the Clerk keys with your actual values');
    } catch (error) {
        console.error('❌ Failed to create .env.local:', error.message);
    }
}

console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on localhost:27017');
console.log('2. Update Clerk keys in .env.local if you have them');
console.log('3. Run: npm run dev');
console.log('\n🔍 To test MongoDB connection, run: npm run db:test');
