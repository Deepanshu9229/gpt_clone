import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'


console.log("=== AI API Debug Info ===");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded (" + process.env.OPENAI_API_KEY.substring(0, 10) + "...)" : "❌ Missing");
console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "✅ Loaded (" + process.env.ANTHROPIC_API_KEY.substring(0, 10) + "...)" : "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("=========================");


export async function POST(req: NextRequest) {
  try {
    const { userId } = (await auth()) || {}
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { messages = [], model = 'gpt-4' } = body
    
    console.log('📨 Received request body:', body);
    console.log('📝 Messages:', messages);
    console.log('🤖 Model:', model);

    // Try real streaming if SDK + keys available
    if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🔄 Attempting to import AI SDK packages...');
        
        const { streamText, convertToCoreMessages } = await import('ai')
        console.log('✅ AI package imported successfully');
        
        const { createOpenAI } = await import('@ai-sdk/openai')
        console.log('✅ OpenAI SDK imported successfully');
        
        const { createAnthropic } = await import('@ai-sdk/anthropic')
        console.log('✅ Anthropic SDK imported successfully');
        
                const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
        console.log('✅ Google Gemini SDK imported successfully');
        
        console.log('🔄 Creating AI providers...');
        const openaiProvider = createOpenAI({
          apiKey: process.env.OPENAI_API_KEY!
        })
        const anthropicProvider = createAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY!
        })
        const googleProvider = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_API_KEY!
        })
        
        console.log('✅ AI providers created');

        console.log('🔄 Preparing messages for AI...');
        console.log('📝 Messages before conversion:', messages);
        console.log('📝 Messages type:', typeof messages, Array.isArray(messages));
        
        // Create properly formatted messages for AI SDK v2
        const formattedMessages = [
          { role: 'system', content: 'You are a helpful assistant. Be concise and accurate.' },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ];
        
        console.log('🔧 Formatted messages:', formattedMessages);
        
        // Safety check - ensure messages are valid
        if (!formattedMessages || !Array.isArray(formattedMessages) || formattedMessages.length === 0) {
          throw new Error('Invalid messages array received');
        }
        
        // Validate each message has required properties
        formattedMessages.forEach((msg, index) => {
          if (!msg || typeof msg !== 'object' || !msg.role || !msg.content) {
            throw new Error(`Invalid message at index ${index}: ${JSON.stringify(msg)}`);
          }
        });
        
        console.log('🔄 Skipping message conversion, using formatted messages directly');

        console.log('🔄 Calling AI service...');
        const lower = String(model).toLowerCase()
        let result;
        
                 // Try Gemini first (best free tier), then Claude, then OpenAI
         try {
           // Use Gemini for all requests (best free tier: 15 req/min, 1500 req/day)
           const geminiModel = 'gemini-1.5-flash'; // Fast and accessible model
           console.log('🤖 Using Google Gemini model:', geminiModel);
           result = await streamText({ 
             model: googleProvider(geminiModel), 
             messages: formattedMessages, 
             temperature: 0.7 
           })
         } catch (geminiError: any) {
           console.log('⚠️ Gemini failed, trying Claude as fallback...');
           
           try {
             // Fallback to Claude
             const claudeModel = 'claude-3-haiku-20240307';
             console.log('🤖 Fallback to Claude model:', claudeModel);
             result = await streamText({ 
               model: anthropicProvider(claudeModel), 
               messages: formattedMessages, 
               temperature: 0.7 
             })
           } catch (claudeError: any) {
             console.log('⚠️ Claude failed, trying OpenAI as final fallback...');
             
             try {
               // Final fallback to OpenAI
               const openaiModel = 'gpt-3.5-turbo';
               console.log('🤖 Final fallback to OpenAI model:', openaiModel);
               result = await streamText({ 
                 model: openaiProvider(openaiModel), 
                 messages: formattedMessages, 
                 temperature: 0.7 
               })
             } catch (openaiError: any) {
               console.log('❌ All AI services failed: Gemini, Claude, and OpenAI');
               throw geminiError; // Re-throw to trigger fallback message
             }
           }
         }
        
                 console.log('✅ AI response received, returning stream');
         
         // Check if the result contains an error
         if (result && typeof result === 'object' && 'error' in result) {
           const error = (result as any).error;
           console.error('❌ AI service returned error:', error);
           throw new Error(`AI service error: ${error?.message || 'Unknown error'}`);
         }
         
         return result.toTextStreamResponse()
      } catch (e: any) {
        console.error('❌ AI SDK import/execution failed:', e);
        console.error('❌ Error details:', {
          message: e.message,
          stack: e.stack,
          name: e.name
        });
        // fall through to fallback stream
      }
    }

    // Fallback: simple streaming text so UI still works
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunks = [
          "I'm here and listening. ",
          'Enable OPENAI_API_KEY or ANTHROPIC_API_KEY for real AI streaming. ',
          'UI streaming is functioning correctly.'
        ]
        let i = 0
        const timer = setInterval(() => {
          if (i < chunks.length) controller.enqueue(encoder.encode(chunks[i++]))
          else { clearInterval(timer); controller.close() }
        }, 200)
      }
    })
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Chat error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const dynamic = 'force-dynamic'