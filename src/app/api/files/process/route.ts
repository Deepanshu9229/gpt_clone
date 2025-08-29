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
    let summary = ''

    try {
      if (fileType === 'application/pdf') {
        // Dynamic import to avoid build-time issues
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(fileBuffer)
        extractedText = pdfData.text
        metadata = {
          pages: pdfData.numpages,
          encoding: 'utf-8',
          info: pdfData.info || {}
        }
        summary = `PDF document with ${pdfData.numpages} pages. ${extractedText.slice(0, 200)}...`
      } else if (fileType.includes('wordprocessingml') || fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml')) {
        const docResult = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = docResult.value
        metadata = {
          encoding: 'utf-8',
          warnings: docResult.messages || []
        }
        summary = `Word document: ${extractedText.slice(0, 200)}...`
      } else if (fileType === 'text/plain') {
        extractedText = fileBuffer.toString('utf-8')
        metadata = {
          encoding: 'utf-8',
          lines: extractedText.split('\n').length
        }
        summary = `Text file with ${extractedText.split('\n').length} lines: ${extractedText.slice(0, 200)}...`
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
              format: uploadResult.format,
              size: uploadResult.bytes
            }
            summary = `Image file (${uploadResult.width}x${uploadResult.height}) uploaded to Cloudinary`
          }
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError)
          summary = `Image file uploaded successfully`
        }
      } else if (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
        // Handle CSV and Excel files
        try {
          const XLSX = (await import('xlsx')).default
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          
          if (jsonData && jsonData.length > 0 && Array.isArray(jsonData[0])) {
            const firstRow = jsonData[0] as any[]
            extractedText = `Spreadsheet with ${jsonData.length} rows and ${firstRow.length || 0} columns.\nHeaders: ${firstRow.join(', ')}\nFirst few rows: ${jsonData.slice(1, 4).map((row: any[]) => Array.isArray(row) ? row.join(', ') : '').join('\n')}`
            metadata = {
              sheets: workbook.SheetNames,
              rows: jsonData.length,
              columns: firstRow.length || 0
            }
            summary = `Spreadsheet file with ${jsonData.length} rows processed`
          } else {
            extractedText = 'Spreadsheet file uploaded (no data found)'
            metadata = {
              sheets: workbook.SheetNames,
              rows: 0,
              columns: 0
            }
            summary = 'Spreadsheet file uploaded'
          }
        } catch (excelError) {
          console.error('Excel processing error:', excelError)
          extractedText = 'Spreadsheet file uploaded (processing failed)'
          summary = 'Spreadsheet file uploaded'
        }
      }

      // Update file record with extracted data
      fileRecord.extractedText = extractedText
      fileRecord.cloudinaryUrl = cloudinaryUrl
      fileRecord.metadata = metadata
      fileRecord.summary = summary
      fileRecord.processingStatus = 'completed'
      await fileRecord.save()

      return Response.json({ 
        success: true, 
        fileId: fileRecord._id.toString(), 
        extractedText, 
        cloudinaryUrl,
        metadata,
        summary,
        processingStatus: 'completed'
      })
    } catch (processingError: any) {
      // Update file record with error status
      fileRecord.processingStatus = 'failed'
      fileRecord.errorMessage = processingError?.message || 'Unknown processing error'
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


