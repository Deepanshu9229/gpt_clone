const fs = require('fs');
const path = require('path');

console.log('=== Current .env.local Content ===');

const envLocalPath = '.env.local';

if (fs.existsSync(envLocalPath)) {
    try {
        const content = fs.readFileSync(envLocalPath, 'utf8');
        console.log('📄 File content:');
        console.log('─'.repeat(50));
        console.log(content);
        console.log('─'.repeat(50));
        
        // Check for MongoDB URI
        if (content.includes('MONGODB_URI=')) {
            const mongoLine = content.split('\n').find(line => line.startsWith('MONGODB_URI='));
            if (mongoLine) {
                console.log('\n🔍 Found MONGODB_URI:');
                console.log(mongoLine);
                
                // Check if it's the old URI
                if (mongoLine.includes('deepanshupatel9229')) {
                    console.log('\n⚠️  This appears to be the OLD URI with old credentials!');
                    console.log('💡 You need to update this with new credentials.');
                }
            }
        } else {
            console.log('\n❌ MONGODB_URI not found in .env.local');
        }
        
    } catch (error) {
        console.error('❌ Error reading file:', error.message);
    }
} else {
    console.log('❌ .env.local file not found!');
}

console.log('\n💡 To update your MongoDB URI:');
console.log('1. Go to MongoDB Atlas');
console.log('2. Create new user or reset password');
console.log('3. Update MONGODB_URI in .env.local');
console.log('4. Test with: npm run db:test');
