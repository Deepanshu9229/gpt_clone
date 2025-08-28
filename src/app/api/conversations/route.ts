import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to connect to MongoDB, but don't fail if it doesn't work
    const db = await connectDB();
    
    if (!db) {
      // MongoDB not available, return empty conversations (app will work offline)
      console.log('⚠️ MongoDB not available, returning empty conversations for offline mode')
      return NextResponse.json({ 
        success: true,
        conversations: [],
        offline: true
      });
    }
    
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('_id title model createdAt updatedAt messages')
      .lean();

    // Transform the data to match frontend expectations
    const transformedConversations = conversations.map(conv => ({
      id: typeof conv._id === 'object' && conv._id !== null && 'toString' in conv._id
        ? (conv._id as { toString: () => string }).toString()
        : String(conv._id ?? ''),
      title: conv.title || 'New Chat',
      model: conv.model || 'gpt-4',
      createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
      updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
      messages: conv.messages || []
    }));

    return NextResponse.json({ 
      success: true,
      conversations: transformedConversations 
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    // On any error, return empty conversations so app works offline
    return NextResponse.json({ 
      success: true,
      conversations: [],
      offline: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to connect to MongoDB
    const db = await connectDB();
    
    if (!db) {
      // MongoDB not available, create a local conversation
      console.log('⚠️ MongoDB not available, creating local conversation')
      return NextResponse.json({
        success: true,
        conversation: {
          id: Date.now().toString(),
          title: 'New Chat',
          model: 'gpt-4',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        },
        local: true,
        offline: true
      }, { status: 201 });
    }
    
    const body = await request.json();
    const { title = 'New Chat', model = 'gpt-4', messages = [] } = body;

    // Validate input
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid title provided' 
      }, { status: 400 });
    }

    const conversation = new Conversation({ 
      userId, 
      title: title.trim(), 
      model, 
      messages,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedConversation = await conversation.save();

    if (!savedConversation) {
      throw new Error('Failed to save conversation to database');
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: savedConversation._id.toString(),
        title: savedConversation.title,
        model: savedConversation.model,
        createdAt: savedConversation.createdAt,
        updatedAt: savedConversation.updatedAt,
        messages: savedConversation.messages || []
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    
    // On any error, create a local conversation
    return NextResponse.json({
      success: true,
      conversation: {
        id: Date.now().toString(),
        title: 'New Chat',
        model: 'gpt-4',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      },
      local: true,
      offline: true
    }, { status: 201 });
  }
}