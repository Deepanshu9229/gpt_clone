// src/app/api/conversations/[id]/messages/route.ts
import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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
    const { content, role, attachments = [] } = await request.json();

    if (!content || !role) {
      return NextResponse.json({ 
        success: false,
        error: 'Content and role are required' 
      }, { status: 400 });
    }

    await connectDB();

    const conversation = await Conversation.findOne({ 
      _id: conversationId, 
      userId 
    });

    if (!conversation) {
      return NextResponse.json({ 
        success: false,
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    const newMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      attachments
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();

    // Update title if this is the first user message
    if (
      conversation.messages.filter((m: { role: string }) => m.role === 'user').length === 1 &&
      role === 'user'
    ) {
      conversation.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }

    await conversation.save();

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        model: conversation.model,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages
      }
    });

  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add message'
    }, { status: 500 });
  }
}