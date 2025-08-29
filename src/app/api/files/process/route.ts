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

    // Validate file size (10MB limit)
    if (fileSize > 10 * 1024 * 1024) {
      return Response.json({ 
        success: false, 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 })
    }

    // Create file record with pending status
    const fileRecord = new File({
      userId,
      fileName,
      originalName: fileName,
      fileType,
      fileSize,
      uploadcareUrl: fileUrl,
      processingStatus: 'processing'
    })

    await fileRecord.save()

    const fileResponse = await fetch(fileUrl)
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())

    let extractedText = ''
    let cloudinaryUrl = ''
    let metadata = {}

    try {
      if (fileType === 'application/pdf') {
        // Dynamic import to avoid build-time issues
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(fileBuffer)
        extractedText = pdfData.text
        metadata = {
          pages: pdfData.numpages,
          encoding: 'utf-8'
        }
      } else if (fileType.includes('wordprocessingml') || fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml')) {
        const docResult = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = docResult.value
        metadata = {
          encoding: 'utf-8'
        }
      } else if (fileType === 'text/plain') {
        extractedText = fileBuffer.toString('utf-8')
        metadata = {
          encoding: 'utf-8'
        }
      } else if (fileType.startsWith('image/')) {
        try {
          if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
            const uploadResult = await cloudinary.uploader.upload(fileUrl, {
              resource_type: 'auto',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            })
            cloudinaryUrl = uploadResult.secure_url
            metadata = {
              width: uploadResult.width,
              height: uploadResult.height,
              encoding: 'auto'
            }
          }
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError)
        }
      }

      // Update file record with extracted data
      fileRecord.extractedText = extractedText
      fileRecord.cloudinaryUrl = cloudinaryUrl
      fileRecord.metadata = metadata
      fileRecord.processingStatus = 'completed'
      await fileRecord.save()

      return Response.json({ 
        success: true, 
        fileId: fileRecord._id.toString(), 
        extractedText, 
        cloudinaryUrl,
        metadata,
        processingStatus: 'completed'
      })
    } catch (processingError) {
      // Update file record with error status
      fileRecord.processingStatus = 'failed'
      fileRecord.errorMessage = processingError.message
      await fileRecord.save()

      return Response.json({ 
        success: false, 
        error: 'File processing failed',
        fileId: fileRecord._id.toString(),
        processingStatus: 'failed'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('File processing error:', error)
    return Response.json({ 
      success: false, 
      error: 'File processing failed' 
    }, { status: 500 })
  }
}


