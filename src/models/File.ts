import mongoose from 'mongoose'

const FileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  uploadcareUrl: String,
  cloudinaryUrl: String,
  extractedText: String,
  createdAt: { type: Date, default: Date.now },
})

export const File = mongoose.models.File || mongoose.model('File', FileSchema)


