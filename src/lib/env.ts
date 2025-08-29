import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file first (Next.js priority)
config({ path: resolve(process.cwd(), '.env.local') })

// Fallback to .env if .env.local doesn't exist
config({ path: resolve(process.cwd(), '.env') })

// Environment variables interface
export interface EnvConfig {
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
  GROQ_API_KEY: string
  ANTHROPIC_API_KEY: string
  OPENAI_API_KEY: string
  MONGODB_URI: string
  NODE_ENV: string
}

// Environment variables
export const env: EnvConfig = {
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  MONGODB_URI: process.env.MONGODB_URI || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
}

// Validation function
export function validateEnv(): void {
  const requiredVars = [
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'GROQ_API_KEY',
    'MONGODB_URI'
  ]

  const missing = requiredVars.filter(key => !env[key as keyof EnvConfig])

  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing)
    console.warn('Make sure your .env.local file contains all required variables')
  } else {
    console.log('✅ All environment variables loaded successfully')
  }
}
