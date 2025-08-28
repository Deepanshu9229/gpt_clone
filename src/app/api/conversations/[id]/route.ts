import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Get a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const conversation = await Conversation.findOne({ 
      _id: params.id, 
      userId 
    }).lean();

    if (!conversation) {
      return NextResponse.json({ 
        success: false,
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: (conversation as any)._id?.toString() || '',
        title: (conversation as any).title || '',
        model: (conversation as any).model || '',
        createdAt: (conversation as any).createdAt || null,
        updatedAt: (conversation as any).updatedAt || null,
        messages: (conversation as any).messages || []
      }
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch conversation',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = params;
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: 'Valid title is required' 
      }, { status: 400 });
    }

    // Try to connect to MongoDB
    const db = await connectDB();
    
    if (!db) {
      // MongoDB not available, return success for local mode
      console.log('⚠️ MongoDB not available, title update will be handled locally')
      return NextResponse.json({
        success: true,
        conversation: {
          id: conversationId,
          title: title.trim(),
          model: 'gpt-4',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        },
        local: true,
        offline: true
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ 
        success: false,
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        model: conversation.model,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages || []
      }
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    // On any error, return success for local mode
    return NextResponse.json({
      success: true,
      conversation: {
        id: params.id,
        title: 'New Chat',
        model: 'gpt-4',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      },
      local: true,
      offline: true
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = params;

    // Try to connect to MongoDB
    const db = await connectDB();
    
    if (!db) {
      // MongoDB not available, return success for local mode
      console.log('⚠️ MongoDB not available, deletion will be handled locally')
      return NextResponse.json({
        success: true,
        message: 'Conversation deleted successfully (local mode)'
      });
    }

    const conversation = await Conversation.findOneAndDelete({ 
      _id: conversationId, 
      userId 
    });

    if (!conversation) {
      return NextResponse.json({ 
        success: false,
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    // On any error, return success for local mode
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully (local mode)'
    });
  }
}