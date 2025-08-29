# API Migration Summary: Gemini → Anthropic + OpenAI Fallback

## Overview
This document summarizes the changes made to migrate from Google Gemini API (which is shutting down) to Anthropic Claude as the primary service, with OpenAI GPT as a fallback.

## Changes Made

### 1. API Route Updates (`src/app/api/chat/route.ts`)
- **Removed**: Google Gemini SDK imports and provider creation
- **Updated**: Primary service to use Anthropic Claude (`claude-3-haiku-20240307`)
- **Added**: Fallback to OpenAI GPT (`gpt-3.5-turbo`) if Claude fails
- **Changed**: Default model from `gpt-4` to `claude-3-haiku`

### 2. Dependencies (`package.json`)
- **Removed**: `@ai-sdk/google` package (no longer needed)
- **Kept**: `@ai-sdk/anthropic` and `@ai-sdk/openai` for fallback support

### 3. Chat Provider (`src/components/chat-provider.tsx`)
- **Updated**: Function signatures to accept model parameter
- **Changed**: Default model from `gpt-4` to `claude-3-haiku`
- **Enhanced**: Model selection integration with conversation creation

### 4. Chat Area Component (`src/components/chat-area.tsx`)
- **Updated**: Model selection dropdown to use AI configuration
- **Enhanced**: Dynamic model options with descriptions
- **Integrated**: Model selection with conversation creation

### 5. Database Schema (`src/models/Conversation.ts`)
- **Updated**: Default model from `gpt-4` to `claude-3-haiku`
- **Enhanced**: Model enum to include all available Claude and GPT models

### 6. AI Configuration (`src/lib/ai-config.ts`)
- **Updated**: Default fallback model to `claude-3-haiku`
- **Maintained**: All existing model configurations

### 7. Environment Setup (`setup-env.js`)
- **Updated**: Environment variable setup to include AI API keys
- **Added**: Instructions for Anthropic and OpenAI API keys
- **Removed**: References to Google API keys

### 8. Documentation (`README.md`)
- **Updated**: Environment configuration section
- **Added**: AI API key configuration instructions

## New API Flow

### Primary Service: Anthropic Claude
1. **Model**: `claude-3-haiku-20240307`
2. **Provider**: Anthropic
3. **Fallback**: If Claude fails, automatically try OpenAI

### Fallback Service: OpenAI GPT
1. **Model**: `gpt-3.5-turbo`
2. **Provider**: OpenAI
3. **Usage**: Only when Claude is unavailable

## Environment Variables Required

```bash
# Primary AI Service
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Fallback AI Service
OPENAI_API_KEY=your_openai_api_key_here

# Other required variables
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## Benefits of New Setup

1. **Reliability**: Claude as primary, GPT as backup
2. **Cost Efficiency**: Claude Haiku is cost-effective for most use cases
3. **Performance**: Claude models offer excellent performance
4. **Fallback**: Automatic failover if primary service is down
5. **Future-Proof**: No dependency on shutting down Gemini service

## Testing

To test the new setup:

1. **Set API Keys**: Add your Anthropic and OpenAI API keys to `.env.local`
2. **Start App**: Run `npm run dev`
3. **Send Message**: Try sending a message in the chat
4. **Check Logs**: Monitor console for API service selection logs
5. **Test Fallback**: Temporarily disable Anthropic key to test OpenAI fallback

## Troubleshooting

### Common Issues

1. **"Both AI services failed"**: Check both API keys are valid
2. **"Claude failed"**: Verify Anthropic API key and quota
3. **"OpenAI failed"**: Verify OpenAI API key and quota

### Debug Steps

1. Check environment variables are loaded
2. Verify API keys are valid
3. Check API quotas and billing
4. Monitor console logs for detailed error information

## Migration Complete ✅

The application has been successfully migrated from Gemini API to Anthropic + OpenAI fallback. All existing functionality is preserved with improved reliability and cost efficiency.
