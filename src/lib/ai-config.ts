export const AI_MODELS = {
  // Groq Models (Primary - Fastest)
  'llama3-8b': { name: 'LLaMA 3 8B', provider: 'groq', model: 'llama3-8b-8192', contextLimit: 8192, description: 'Fast and efficient 8B model', maxTokens: 1500 },
  'llama3-70b': { name: 'LLaMA 3 70B', provider: 'groq', model: 'llama3-70b-8192', contextLimit: 8192, description: 'High performance 70B model', maxTokens: 2000 },
  'mixtral-8x7b': { name: 'Mixtral 8x7B', provider: 'groq', model: 'mixtral-8x7b-32768', contextLimit: 32768, description: 'Balanced performance and speed', maxTokens: 2000 },
  'gemma2-9b': { name: 'Gemma2 9B', provider: 'groq', model: 'gemma2-9b-it', contextLimit: 8192, description: 'Google Gemma2 model', maxTokens: 1500 },
  
  // OpenAI Models (Fallback)
  'gpt-4': { name: 'GPT-4', provider: 'openai', model: 'gpt-4', contextLimit: 8000, description: 'Most capable model', maxTokens: 2000 },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'openai', model: 'gpt-4-turbo-preview', contextLimit: 128000, description: 'Faster with larger context', maxTokens: 2000 },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'openai', model: 'gpt-3.5-turbo', contextLimit: 4000, description: 'Fast and efficient', maxTokens: 1500 },
  
  // Anthropic Models (Secondary Fallback)
  'claude-3-opus': { name: 'Claude 3 Opus', provider: 'anthropic', model: 'claude-3-opus-20240229', contextLimit: 200000, description: "Anthropic's most capable", maxTokens: 2000 },
  'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'anthropic', model: 'claude-3-sonnet-20240229', contextLimit: 200000, description: 'Balanced performance', maxTokens: 2000 },
  'claude-3-haiku': { name: 'Claude 3 Haiku', provider: 'anthropic', model: 'claude-3-haiku-20240307', contextLimit: 200000, description: 'Fast and affordable', maxTokens: 1500 },
} as const

export type AIModelId = keyof typeof AI_MODELS

export function getModelConfig(modelId: string) {
  const m = AI_MODELS[modelId as AIModelId]
  if (!m) return AI_MODELS['llama3-8b'] // Default to Groq LLaMA 3 8B
  return m
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function createSystemPrompt(userContext?: string): string {
  const base = `You are a helpful AI assistant. Be concise, clear, and accurate.
Current date: ${new Date().toISOString().split('T')[0]}
- Use markdown when useful
- Give examples when explaining
- Admit limits when unsure
- Stay on topic`
  
  if (userContext?.trim()) {
    return `${base}

Previous context:
${userContext.slice(0, 500)}...

Use this to personalize responses; do not explicitly mention memory.`
  }
  return base
}

export function truncateMessages(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
) {
  let total = 0
  const result: Array<{ role: string; content: string }> = []
  const sys = messages.find(m => m.role === 'system')
  
  if (sys) {
    total += estimateTokens(sys.content)
    result.push(sys)
  }
  
  const rest = messages.filter(m => m.role !== 'system').reverse()
  for (const m of rest) {
    const t = estimateTokens(m.content)
    if (total + t > maxTokens * 0.8) break
    result.unshift(m)
    total += t
  }
  return result
}

export function handleAIError(error: any): string {
  const msg = error?.message || ''
  if (msg.includes('rate limit')) return "I'm receiving too many requests. Please try again shortly."
  if (msg.includes('context length')) return 'This conversation is too long. Please start a new chat.'
  if (msg.includes('API key')) return "There's an issue with the AI service configuration."
  if (msg.includes('credit balance') || msg.includes('insufficient funds')) return "The AI service needs credits. Please check your account."
  console.error('AI Error:', error)
  return "I'm having trouble responding right now. Please try again shortly."
}