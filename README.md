# GPT Clone with Advanced File Upload System

A modern, feature-rich AI chat application with intelligent file processing and analysis capabilities.

## ✨ Features

### 🤖 AI Chat
- **Multi-Model Support**: Claude, GPT-4, Groq, and more
- **Conversation Management**: Create, edit, and organize chat threads
- **Real-time Streaming**: Instant AI responses with streaming
- **Context Awareness**: AI remembers conversation history

### 📁 Advanced File Upload System
- **Drag & Drop Interface**: Seamless file uploads with Uploadcare
- **Multi-Format Support**: PDF, Word, Excel, CSV, Images, Text files
- **Intelligent Parsing**: Automatic text extraction and metadata generation
- **AI Integration**: AI can read, analyze, and respond to uploaded files
- **Secure Storage**: Cloudinary integration for file management

### 🔐 Authentication & Security
- **Clerk Integration**: Secure user authentication
- **User-specific Data**: Private conversations and file storage
- **Environment-based Security**: Secure API key management

## 🚀 Quick Start

### 1. Environment Setup
```bash
npm run setup
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Services
Update `.env.local` with your API keys:
- **Uploadcare**: For file uploads
- **Cloudinary**: For file storage
- **AI Service**: Anthropic, OpenAI, or Groq
- **Clerk**: For authentication
- **MongoDB**: For data persistence

### 4. Start Development Server
```bash
npm run dev
```

## 🔧 File Upload System

### How It Works
1. **File Upload**: Users drag & drop files using Uploadcare widget
2. **Processing**: Files are automatically parsed and text extracted
3. **AI Analysis**: AI receives file context and can analyze content
4. **Smart Responses**: AI provides intelligent responses based on file content

### Supported File Types
- **Documents**: PDF, Word (.docx), Text files
- **Spreadsheets**: Excel (.xlsx), CSV files
- **Images**: JPG, PNG, GIF with metadata extraction
- **Text**: Plain text with line counting

### AI File Reading
The AI can:
- Read and summarize document content
- Analyze spreadsheet data
- Describe image content and metadata
- Answer questions about uploaded files
- Provide insights based on file content

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive design
- **Uploadcare Widget**: Professional file upload interface

### Backend
- **API Routes**: RESTful endpoints for chat and files
- **MongoDB**: Document database for conversations and files
- **File Processing**: Intelligent parsing with multiple libraries
- **AI Integration**: Multi-provider AI service support

### File Processing Pipeline
```
Upload → Parse → Extract → Store → AI Context → Response
```

## 📦 Dependencies

### Core
- `next`: React framework
- `react`: UI library
- `typescript`: Type safety

### File Processing
- `@uploadcare/react-widget`: File upload interface
- `cloudinary`: File storage and optimization
- `pdf-parse`: PDF text extraction
- `mammoth`: Word document parsing
- `xlsx`: Excel/CSV processing

### AI & Database
- `@ai-sdk/anthropic`: Claude AI integration
- `@ai-sdk/openai`: GPT integration
- `mongoose`: MongoDB ODM
- `@clerk/nextjs`: Authentication

## 🌐 Environment Variables

```env
# AI Services
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here

# File Upload
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_key_here
CLOUDINARY_API_KEY=your_key_here
CLOUDINARY_API_SECRET=your_secret_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Database
MONGODB_URI=your_connection_string

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
```

## 📱 Usage

### Uploading Files
1. Click the paperclip icon in the chat
2. Drag & drop files or select from your device
3. Wait for processing to complete
4. AI will automatically read and analyze the file

### Chatting with Files
1. Upload a file (PDF, Word, Excel, etc.)
2. Ask questions about the file content
3. AI responds with insights based on the file
4. Continue the conversation with file context

### File Management
- View processing status in real-time
- See file summaries and extracted text
- Remove files from conversations
- Track file metadata and size

## 🔍 Troubleshooting

### Common Issues
- **File Processing Failed**: Check file size (10MB limit) and format
- **AI Not Responding**: Verify API keys and service status
- **Upload Issues**: Ensure Uploadcare configuration is correct

### Debug Commands
```bash
npm run db:test      # Test database connection
npm run test:app     # Test application setup
npm run setup        # Reconfigure environment
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Ensure all environment variables are set
- Configure MongoDB connection string
- Set up file upload service credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This README
- **Setup Help**: Run `npm run setup` for guided configuration

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
