const fs = require('fs');

console.log('=== Environment Check ===');
console.log('Current directory:', process.cwd());
console.log('File exists:', fs.existsSync('.env.local'));

if (fs.existsSync('.env.local')) {
    const content = fs.readFileSync('.env.local', 'utf8');
    console.log('File size:', content.length);
    console.log('Contains MONGODB_URI:', content.includes('MONGODB_URI'));
    console.log('First line:', content.split('\n')[0]);
} else {
    console.log('❌ .env.local not found');
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');
