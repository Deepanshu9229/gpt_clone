const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping setup.');
  console.log('If you need to update it, please edit the file manually.');
  process.exit(0);
}

// Environment variables template
const envTemplate = `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Groq AI API Key (Primary - Fastest)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI API Key (Fallback)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Anthropic API Key (Secondary Fallback)
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Uploadcare (File Uploads)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key_here

# Environment
NODE_ENV=development
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local file created successfully!');
  console.log('');
  console.log('📝 Please update the following values in .env.local:');
  console.log('   - Clerk API keys (from https://dashboard.clerk.com)');
  console.log('   - Groq API key (from https://console.groq.com/keys)');
  console.log('   - OpenAI API key (from https://platform.openai.com/api-keys)');
  console.log('   - Anthropic API key (from https://console.anthropic.com)');
  console.log('   - MongoDB connection string');
  console.log('   - Uploadcare public key (optional)');
  console.log('');
  console.log('🚀 After updating the keys, run: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}
