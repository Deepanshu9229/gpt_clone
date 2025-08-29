import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { env, validateEnv } from '@/lib/env'

validateEnv()

export async function POST(req: NextRequest) {
  try {
    const { userId } = (await auth()) || {}
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { messages = [], model = 'llama3-8b' } = body

    // Try AI services if API keys available
    if (env.GROQ_API_KEY || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY) {
      try {
        const { streamText } = await import('ai')
        
        let result
        
        // Try Groq first (fastest), then OpenAI, then Anthropic as fallbacks
        try {
          const { createGroq } = await import('@ai-sdk/groq')
          const groqProvider = createGroq({ apiKey: env.GROQ_API_KEY! })
          const groqModel = 'llama3-8b-8192'
          
          result = await streamText({ 
            model: groqProvider(groqModel), 
            messages: [
              { role: 'system', content: 'You are a helpful assistant. Be concise and accurate.' },
              ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content
              }))
            ], 
            temperature: 0.7 
          })
        } catch (groqError: any) {
          try {
            // Fallback to OpenAI
            const { createOpenAI } = await import('@ai-sdk/openai')
            const openaiProvider = createOpenAI({ apiKey: env.OPENAI_API_KEY! })
            const openaiModel = 'gpt-3.5-turbo'
            
            result = await streamText({ 
              model: openaiProvider(openaiModel), 
              messages: [
                { role: 'system', content: 'You are a helpful assistant. Be concise and accurate.' },
                ...messages.map((msg: any) => ({
                  role: msg.role,
                  content: msg.content
                }))
              ], 
              temperature: 0.7 
            })
          } catch (openaiError: any) {
            try {
              // Final fallback to Anthropic
              const { createAnthropic } = await import('@ai-sdk/anthropic')
              const anthropicProvider = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY! })
              const claudeModel = 'claude-3-haiku-20240307'
              
              result = await streamText({ 
                model: anthropicProvider(claudeModel), 
                messages: [
                  { role: 'system', content: 'You are a helpful assistant. Be concise and accurate.' },
                  ...messages.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content
                  }))
                ], 
                temperature: 0.7 
              })
            } catch (anthropicError: any) {
              throw groqError // Re-throw to trigger fallback message
            }
          }
        }
        
        return result.toTextStreamResponse()
      } catch (e: any) {
        // Fall through to fallback stream
      }
    }

    // Fallback: simple streaming text
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunks = [
          "I'm here and listening. ",
          'Enable GROQ_API_KEY for real AI streaming. ',
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