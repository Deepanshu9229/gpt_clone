const fs = require('fs');
const path = require('path');

console.log('=== Testing Environment Loading ===');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local file exists');
    
    // Read and parse the file
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const lines = content.split('\n');
    
    // Check for specific keys
    const clerkPubKey = lines.find(line => line.startsWith('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='));
    const clerkSecretKey = lines.find(line => line.startsWith('CLERK_SECRET_KEY='));
    const anthropicKey = lines.find(line => line.startsWith('ANTHROPIC_API_KEY='));
    const openaiKey = lines.find(line => line.startsWith('OPENAI_API_KEY='));
    
    console.log('📋 Environment Variables Status:');
    console.log('  Clerk Publishable Key:', clerkPubKey ? '✅ Found' : '❌ Missing');
    console.log('  Clerk Secret Key:', clerkSecretKey ? '✅ Found' : '❌ Missing');
    console.log('  Anthropic API Key:', anthropicKey ? '✅ Found' : '❌ Missing');
    console.log('  OpenAI API Key:', openaiKey ? '✅ Found' : '❌ Missing');
    
    // Check if keys are real or placeholders
    if (clerkPubKey) {
        const key = clerkPubKey.split('=')[1];
        if (key.includes('your_actual') || key.includes('placeholder')) {
            console.log('⚠️  Clerk Publishable Key appears to be a placeholder');
        } else {
            console.log('✅ Clerk Publishable Key looks like a real key');
        }
    }
    
    if (clerkSecretKey) {
        const key = clerkSecretKey.split('=')[1];
        if (key.includes('your_actual') || key.includes('placeholder')) {
            console.log('⚠️  Clerk Secret Key appears to be a placeholder');
        } else {
            console.log('✅ Clerk Secret Key looks like a real key');
        }
    }
    
} else {
    console.log('❌ .env.local file not found');
}

console.log('\n=== Next Steps ===');
console.log('1. Make sure your .env.local contains REAL API keys (not placeholders)');
console.log('2. Run: npm run dev');
console.log('3. Check the console for environment validation messages');
