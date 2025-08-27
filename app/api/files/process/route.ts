import { v2 as cloudinary } from 'cloudinary'
import { connectDB } from '@/lib/mongodb'
import { File } from '@/models/File'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import { auth } from '@clerk/nextjs/server'
export const dynamic = "force-dynamic";
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  const { fileUrl, fileName, fileType, fileSize } = await request.json()

  try {
    const { userId } = await auth();
    await connectDB();

    const fileResponse = await fetch(fileUrl);
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());

    let extractedText = ''
    let cloudinaryUrl = ''

    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(fileBuffer)
      extractedText = pdfData.text
    } else if (fileType.includes('wordprocessingml')) {
      const docResult = await mammoth.extractRawText({ buffer: fileBuffer })
      extractedText = docResult.value
    } else if (fileType === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8')
    } else if (fileType.startsWith('image/')) {
      const uploadResult = await cloudinary.uploader.upload(fileUrl, {
        resource_type: 'auto',
      })
      cloudinaryUrl = uploadResult.secure_url
    }

    const fileRecord = new File({
      userId: userId || 'demo-user',
      fileName,
      originalName: fileName,
      fileType,
      fileSize,
      uploadcareUrl: fileUrl,
      cloudinaryUrl,
      extractedText,
    })

    await fileRecord.save()

    return Response.json({ success: true, fileId: fileRecord._id.toString(), extractedText, cloudinaryUrl })
  } catch (error) {
    console.error('File processing error:', error)
    return Response.json({ error: 'File processing failed' }, { status: 500 })
  }
}


