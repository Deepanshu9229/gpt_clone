# GPT Clone with Advanced File Upload System

Hey there! 👋 This is my take on building a ChatGPT-like app that actually handles files really well. I got tired of ChatGPT's limited file support, so I built something that can actually read and understand your documents, spreadsheets, and images.

## What Makes This Cool

### 🤖 Smart AI Chat
- **Multiple AI Models**: I've integrated Claude, GPT-4, Groq, and others so you can pick what works best, but for now all other API's are paid so only Groq is mentioned and working.
- **Real Conversations**: It remembers what you talked about and keeps context
- **Live Responses**: AI replies stream in real-time, just like the real ChatGPT

### 📁 File Upload That Actually Works
- **Drag & Drop**: Just drag files right into the chat - no more clicking through menus
- **Reads Everything**: PDFs, Word docs, Excel sheets, CSV files, text files - you name it
- **AI Gets It**: The AI actually reads your files and can answer questions about them
- **Smart Processing**: Automatically extracts text and figures out what's in your files
- **Cloud Storage**: Uses Cloudinary so your files are safe and accessible

### 🔐 Security That Makes Sense
- **Clerk Auth**: Clean, simple login that just works
- **Your Data Stays Yours**: Conversations and files are private to your account
- **No API Key Leaks**: Environment variables keep everything secure

## 🛠️ Tech Stack

### **Framework**
- **Next.js** — Using Next.js best practices for optimal performance and SEO

### **Language**
- **TypeScript** — For type safety and better development experience

### **UI/UX**
- **v0.dev** — AI-powered UI/UX design for modern, intuitive interfaces

### **Styling**
- **TailwindCSS** — Utility-first CSS framework for rapid development
- **ShadCN** — Beautiful, accessible component library built on Radix UI

### **Code Editor**
- **Cursor** — AI-powered code editor for faster, smarter development

### **Deployment**
- **Vercel** — For hosting and deployment with automatic CI/CD

### **Database**
- **MongoDB** — Document database for storing conversations and file metadata

### **File Storage**
- **Cloudinary** — For secure, optimized file storage and management

### **File Upload**
- **Uploadcare** — For seamless front-end file upload components

### **Authentication**
- **Clerk** — For managing user authentication and authorization

## Getting Started

### 1. Quick Setup
```bash
npm run setup
```
This will walk you through everything you need to configure.

### 2. Install Stuff
```bash
npm install
```

### 3. Set Up Your Keys
You'll need to add these to your `.env.local`:
- **Uploadcare**: For handling file uploads
- **Cloudinary**: For storing and managing files
- **AI Service**: Pick your favorite (Anthropic, OpenAI, or Groq)
- **Clerk**: For user accounts
- **MongoDB**: For saving your chats and files

### 4. Start Building
```bash
npm run dev
```

## How the File System Works

### The Magic Pipeline
1. **Upload**: Drag a file into the chat
2. **Process**: My system automatically figures out what's in it
3. **AI Reads**: The AI gets the file content and can work with it
4. **Smart Chat**: You can ask questions about your files and get intelligent answers

### What It Can Handle
- **Documents**: PDFs, Word docs, text files
- **Data**: Excel spreadsheets, CSV files
- **Text**: Plain text files with smart analysis

### What You Can Do
- Ask the AI to summarize documents
- Get insights from spreadsheet data
- Have the AI describe image content
- Ask questions about your files
- Get analysis and recommendations

## Tech Stack

### Frontend
- **Next.js 14**: Because it's fast and modern
- **TypeScript**: Because I like my code to work
- **Tailwind CSS**: Because styling should be easy
- **Uploadcare**: Because file uploads shouldn't be painful

### Backend
- **API Routes**: Simple, clean endpoints
- **MongoDB**: Stores your conversations and file info
- **Smart Processing**: Uses the right tool for each file type
- **AI Integration**: Works with multiple AI providers

### File Processing
```
Upload → Figure Out What It Is → Extract Content → Store → Give to AI → Get Smart Response
```

## What You Need to Install

### Core Stuff
- `next`: The framework
- `react`: For the UI
- `typescript`: For sanity

### File Handling
- `@uploadcare/react-widget`: Makes file uploads look good
- `cloudinary`: Stores and optimizes your files
- `pdf-parse`: Reads PDFs
- `mammoth`: Handles Word docs
- `xlsx`: Processes Excel and CSV files

### AI & Database
- `@ai-sdk/anthropic`: For Claude
- `@ai-sdk/openai`: For GPT
- `mongoose`: Talks to MongoDB
- `@clerk/nextjs`: Handles user accounts

## Environment Setup

```env
# AI Services (pick your favorite)
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here

# File Stuff
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_key_here
CLOUDINARY_API_KEY=your_key_here
CLOUDINARY_API_SECRET=your_secret_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Database
MONGODB_URI=your_connection_string

# Users
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
```

## How to Use It

### Uploading Files
1. Click the paperclip in the chat
2. Drag files in or pick them from your computer
3. Wait for it to process (usually just a few seconds)
4. The AI will automatically read and understand your file

### Chatting with Your Files
1. Upload something (PDF, Word doc, Excel sheet, etc.)
2. Ask questions about what's in it
3. Get smart answers based on your actual content
4. Keep chatting - the AI remembers your files

### Managing Files
- See processing status in real-time
- Get summaries of what's in your files
- Remove files when you're done
- Track file info and size

## When Things Go Wrong

### Common Problems
- **File Won't Process**: Check if it's under 10MB and in a supported format
- **AI Not Talking**: Make sure your API keys are set up right
- **Upload Issues**: Double-check your Uploadcare setup

### Debug Commands
```bash
npm run db:test      # Test if database is working
npm run test:app     # Test the whole app setup
npm run setup        # Reconfigure everything
```

## Deploying

### Vercel (Easiest)
1. Connect your GitHub repo
2. Add environment variables in Vercel
3. Push to GitHub and it deploys automatically

### Other Platforms
- Make sure all environment variables are set
- Check your MongoDB connection string
- Verify your file upload service credentials

## Want to Help?

1. Fork the repo
2. Make your changes
3. Test them thoroughly
4. Send a pull request

## License

MIT - do whatever you want with it

## Need Help?

- **Bugs**: Open a GitHub issue
- **Questions**: Check this README
- **Setup Issues**: Run `npm run setup` for help

---

**Built because I wanted something better than ChatGPT for handling files** 🚀
