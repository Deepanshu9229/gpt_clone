// src/app/api/conversations/route.ts
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

    await connectDB();
    
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('_id title model createdAt updatedAt messages')
      .lean();

    const transformedConversations = conversations.map(conv => ({
      id: typeof conv._id === 'object' && conv._id !== null && typeof conv._id.toString === 'function'
        ? conv._id.toString()
        : String(conv._id),
      title: conv.title || 'New Chat',
      model: conv.model || 'claude-3-haiku',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messages: conv.messages || []
    }));

    return NextResponse.json({ 
      success: true,
      conversations: transformedConversations 
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { title = 'New Chat', model = 'claude-3-haiku' } = body;

    const conversation = new Conversation({ 
      userId, 
      title: title.trim(), 
      model, 
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedConversation = await conversation.save();

    return NextResponse.json({
      success: true,
      conversation: {
        id: savedConversation._id.toString(),
        title: savedConversation.title,
        model: savedConversation.model,
        createdAt: savedConversation.createdAt,
        updatedAt: savedConversation.updatedAt,
        messages: []
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create conversation'
    }, { status: 500 });
  }
}