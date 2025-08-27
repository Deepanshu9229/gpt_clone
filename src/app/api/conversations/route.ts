import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) return new Response('Unauthorized', { status: 401 });

    await connectDB();
    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(50);
    return Response.json({ conversations })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) return new Response('Unauthorized', { status: 401 });

    await connectDB();
    const { title, model = 'gpt-4' } = await request.json();
    const conversation = new Conversation({ userId, title, model, messages: [] })
    await conversation.save()
    return Response.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        model: conversation.model,
        createdAt: conversation.createdAt,
      },
    })
  } catch (error) {
    return Response.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}


