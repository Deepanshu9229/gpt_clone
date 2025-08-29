import mongoose from 'mongoose'

const FileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadcareUrl: { type: String, required: true },
  cloudinaryUrl: String,
  extractedText: String,
  summary: String,
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  errorMessage: String,
  metadata: {
    width: Number,
    height: Number,
    pages: Number,
    duration: Number,
    encoding: String,
    sheets: [String],
    rows: Number,
    columns: Number,
    info: mongoose.Schema.Types.Mixed,
    warnings: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update timestamp on save
FileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const File = mongoose.models.File || mongoose.model('File', FileSchema)


