const fs = require('fs');
const path = require('path');

console.log('=== Simple Environment Check ===');
console.log('Current directory:', process.cwd());

// Check if .env.local exists
const envLocalPath = '.env.local';
console.log('Checking for .env.local...');
console.log('File exists:', fs.existsSync(envLocalPath));

if (fs.existsSync(envLocalPath)) {
    console.log('Reading .env.local content...');
    try {
        const content = fs.readFileSync(envLocalPath, 'utf8');
        console.log('File size:', content.length, 'characters');
        console.log('Contains MONGODB_URI:', content.includes('MONGODB_URI'));
        
        // Show first 3 lines
        const lines = content.split('\n');
        console.log('First 3 lines:');
        for (let i = 0; i < Math.min(3, lines.length); i++) {
            console.log(`Line ${i + 1}: "${lines[i]}"`);
        }
        
        // Check for common issues
        if (content.includes('\r\n')) {
            console.log('File has Windows line endings (\\r\\n)');
        } else if (content.includes('\n')) {
            console.log('File has Unix line endings (\\n)');
        } else {
            console.log('WARNING: File might be all on one line!');
        }
        
    } catch (error) {
        console.error('Error reading file:', error.message);
    }
} else {
    console.log('❌ .env.local file not found!');
}

// Check for other env files
console.log('\nChecking for other environment files:');
['.env', '.env.development', '.env.production'].forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('\nCurrent environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');