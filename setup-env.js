const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment for GPT Clone with File Upload System...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 .env.local file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required services
  const hasUploadcare = envContent.includes('NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY');
  const hasCloudinary = envContent.includes('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  const hasAI = envContent.includes('ANTHROPIC_API_KEY') || envContent.includes('OPENAI_API_KEY');
  
  console.log(`📤 Uploadcare: ${hasUploadcare ? '✅ Configured' : '❌ Missing'}`);
  console.log(`☁️ Cloudinary: ${hasCloudinary ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🤖 AI Service: ${hasAI ? '✅ Configured' : '❌ Missing'}`);
  
  if (!hasUploadcare || !hasCloudinary || !hasAI) {
    console.log('\n⚠️ Some required services are not configured. Please add the missing environment variables.');
  }
} else {
  console.log('📁 Creating .env.local file...');
  
  const envTemplate = `# AI Service Configuration
# Choose one of the following:
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
# GROQ_API_KEY=your_groq_api_key_here

# File Upload Services
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local file created successfully!');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Get your Uploadcare public key from: https://uploadcare.com/dashboard/');
console.log('2. Get your Cloudinary credentials from: https://cloudinary.com/console');
console.log('3. Get your AI service API key (Anthropic, OpenAI, or Groq)');
console.log('4. Update the .env.local file with your actual keys');
console.log('5. Run "npm run dev" to start the development server');

console.log('\n🔧 File Upload Features:');
console.log('• Uploadcare: Handles file uploads with drag & drop');
console.log('• Cloudinary: Secure file storage and image optimization');
console.log('• AI Integration: AI can read and analyze uploaded files');
console.log('• Supported formats: PDF, Word, Excel, CSV, Images, Text');

console.log('\n✨ Your file upload system is ready to go!');
