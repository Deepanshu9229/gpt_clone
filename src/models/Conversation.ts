import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  edited?: boolean
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
    extractedText?: string
  }[]
}

export interface IConversation {
  userId: string
  title: string
  messages: IMessage[]
  model: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  id: { 
    type: String, 
    required: true,
    unique: false // Allow duplicate IDs across different conversations
  },
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  edited: { 
    type: Boolean, 
    default: false 
  },
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    extractedText: { type: String }
  }]
}, {
  _id: false // Disable _id for subdocuments
})

const ConversationSchema = new Schema<IConversation>({
  userId: { 
    type: String, 
    required: true, 
    index: true,
    trim: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200,
    default: 'New Chat'
  },
  messages: {
    type: [MessageSchema],
    default: []
  },
  model: { 
    type: String, 
    default: 'claude-3-haiku',
    enum: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    trim: true
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'conversations'
})

// Indexes for better performance
ConversationSchema.index({ userId: 1, updatedAt: -1 })
ConversationSchema.index({ userId: 1, createdAt: -1 })

// Pre-save middleware to ensure title is set
ConversationSchema.pre('save', function(next) {
  if (!this.title || this.title.trim() === '') {
    this.title = 'New Chat'
  }
  next()
})

// Export the model
export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema)