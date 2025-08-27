import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      extractedText: String,
    },
  ],
})

const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  model: { type: String, default: 'gpt-4' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)


