import { v2 as cloudinary } from 'cloudinary'
import { connectDB } from '@/lib/mongodb'
import { File } from '@/models/File'
import mammoth from 'mammoth'
import { auth } from '@clerk/nextjs/server'

// Configure Cloudinary only if environment variables are available
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: Request) {
  const { fileUrl, fileName, fileType, fileSize } = await request.json()

  try {
    const session = await auth();
    const userId = session?.userId || 'demo-user'
    await connectDB()

    const fileResponse = await fetch(fileUrl)
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())

    let extractedText = ''
    let cloudinaryUrl = ''

    if (fileType === 'application/pdf') {
      try {
        // Dynamic import to avoid build-time issues
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(fileBuffer)
        extractedText = pdfData.text
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        extractedText = 'PDF content could not be extracted'
      }
    } else if (fileType.includes('wordprocessingml')) {
      try {
        const docResult = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = docResult.value
      } catch (docError) {
        console.error('Word document parsing error:', docError)
        extractedText = 'Document content could not be extracted'
      }
    } else if (fileType === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8')
    } else if (fileType.startsWith('image/')) {
      try {
        if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
          const uploadResult = await cloudinary.uploader.upload(fileUrl, {
            resource_type: 'auto',
          })
          cloudinaryUrl = uploadResult.secure_url
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError)
      }
    }

    const fileRecord = new File({
      userId,
      fileName,
      originalName: fileName,
      fileType,
      fileSize,
      uploadcareUrl: fileUrl,
      cloudinaryUrl,
      extractedText,
      createdAt: new Date(),
    })

    await fileRecord.save()

    return Response.json({ success: true, fileId: fileRecord._id.toString(), extractedText, cloudinaryUrl })
  } catch (error) {
    console.error('File processing error:', error)
    return Response.json({ error: 'File processing failed' }, { status: 500 })
  }
}


