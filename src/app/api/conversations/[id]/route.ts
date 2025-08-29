// src/app/api/conversations/[id]/route.ts
import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

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
        id: conversation && (conversation as any)._id?.toString?.() || '',
        title: conversation && (conversation as any).title || '',
        model: conversation && (conversation as any).model || '',
        createdAt: conversation && (conversation as any).createdAt || null,
        updatedAt: conversation && (conversation as any).updatedAt || null,
        messages: (conversation && (conversation as any).messages) || []
      }
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch conversation'
    }, { status: 500 });
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

    await connectDB();

    const conversation = await Conversation.findOneAndDelete({ 
      _id: params.id, 
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
    return NextResponse.json({
      success: false,
      error: 'Failed to delete conversation'
    }, { status: 500 });
  }
}