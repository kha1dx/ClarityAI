# Prompt Studio API Documentation

This document provides comprehensive documentation for all implemented backend API endpoints and services.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [State Management](#state-management)
- [Type Definitions](#type-definitions)
- [Testing](#testing)
- [Configuration](#configuration)

## Overview

The Prompt Studio backend is built with:
- **Next.js 15.5.0** with App Router
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **OpenAI API** for AI integration
- **Zustand** for state management

## Project Structure

```
├── app/api/                          # API routes
│   ├── conversations/
│   │   ├── route.ts                 # GET, POST conversations
│   │   ├── [id]/
│   │   │   ├── route.ts            # GET, PUT, DELETE specific conversation
│   │   │   └── messages/
│   │   │       └── route.ts        # GET, POST messages
│   └── ai/
│       ├── generate/
│       │   └── route.ts            # POST AI response generation
│       └── optimize/
│           └── route.ts            # POST prompt optimization
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server Supabase client
│   ├── services/
│   │   ├── conversation-service.ts # Conversation operations
│   │   └── ai-service.ts           # AI integration
│   └── types/
│       └── index.ts                # Type definitions
└── stores/
    ├── chat-store.ts               # Chat state management
    └── conversation-store.ts       # Conversation state management
```

## API Endpoints

### Conversations

#### GET /api/conversations
List all conversations for a user.

**Parameters:**
- `userId` (query, required): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "user_id": "user_456",
      "title": "My Conversation",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "messages": [...]
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### POST /api/conversations
Create a new conversation.

**Body:**
```json
{
  "title": "New Conversation",
  "userId": "user_456",
  "category": "optional_category"
}
```

#### GET /api/conversations/[id]
Get a specific conversation with messages.

**Parameters:**
- `id` (path, required): Conversation ID
- `userId` (query, required): User ID

#### PUT /api/conversations/[id]
Update a conversation (currently supports title updates).

**Parameters:**
- `id` (path, required): Conversation ID
- `userId` (query, required): User ID

**Body:**
```json
{
  "title": "Updated Title"
}
```

#### DELETE /api/conversations/[id]
Delete a conversation and all associated messages.

**Parameters:**
- `id` (path, required): Conversation ID
- `userId` (query, required): User ID

### Messages

#### GET /api/conversations/[id]/messages
Get all messages for a conversation.

**Parameters:**
- `id` (path, required): Conversation ID

#### POST /api/conversations/[id]/messages
Add a new message to a conversation.

**Parameters:**
- `id` (path, required): Conversation ID

**Body:**
```json
{
  "role": "user", // or "assistant"
  "content": "Message content",
  "tokensUsed": 10, // optional
  "cost": 0.001 // optional
}
```

### AI Services

#### POST /api/ai/generate
Generate an AI response for a conversation.

**Body:**
```json
{
  "conversationHistory": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "userId": "user_456",
  "model": "gpt-4o", // optional
  "temperature": 0.7, // optional
  "maxTokens": 1000 // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Generated response",
    "usage": {
      "tokens_used": 50,
      "estimated_cost": 0.001,
      "model_used": "gpt-4o",
      "processing_time_ms": 1200
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/ai/optimize
Optimize a prompt based on conversation history.

**Body:**
```json
{
  "conversationHistory": [...],
  "userId": "user_456",
  "optimizationType": "effectiveness" // "clarity", "effectiveness", or "conciseness"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original_prompt": "Original prompt text",
    "optimized_prompt": "Optimized prompt text",
    "improvements": ["Improvement 1", "Improvement 2"],
    "confidence_score": 85,
    "tokens_used": 200,
    "cost": 0.004,
    "optimization_type": "effectiveness",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Services

### ConversationService

Located at `/lib/services/conversation-service.ts`

**Key Methods:**
- `createConversation(userId, title, category?)`
- `getConversations(userId)`
- `getConversation(conversationId, userId)`
- `updateConversationTitle(conversationId, userId, title)`
- `deleteConversation(conversationId, userId)`
- `saveMessage(conversationId, role, content, tokensUsed?, cost?)`
- `getMessages(conversationId)`
- `savePromptResult(conversationId, generatedPrompt, metadata?)`

### AIService

Located at `/lib/services/ai-service.ts`

**Key Methods:**
- `generateConversationResponse(conversationHistory, config?)`
- `generateOptimizedPrompt(conversationHistory, optimizationType?)`
- `estimateTokens(text)`
- `calculateCost(tokens, model?)`
- `validateConfiguration()`
- `generateConversationTitle(messages)`

## State Management

### Chat Store (Zustand)

Located at `/stores/chat-store.ts`

**State:**
- `conversations`: Array of chat conversations
- `messages`: Record of conversation ID to messages array
- `currentConversationId`: Currently active conversation
- `uiState`: UI-related state

**Actions:**
- `addConversation()`, `updateConversation()`, `deleteConversation()`
- `addMessage()`, `updateMessage()`, `deleteMessage()`
- `toggleSidebar()`, `setSearchQuery()`, `setActiveTab()`

### Conversation Store (Zustand)

Located at `/stores/conversation-store.ts`

**State:**
- `conversations`: Array of prompt conversations
- `currentConversation`: Currently active conversation
- `isLoading`: Loading state
- `error`: Error state

**Actions:**
- `loadConversations()`, `createConversation()`, `updateConversation()`, `deleteConversation()`
- `addMessage()`, `generateResponse()`, `optimizePrompt()`

## Type Definitions

Located at `/lib/types/index.ts`

**Key Types:**
- `Conversation`, `ConversationWithMessages`
- `Message`, `ConversationMessage`
- `PromptConversation`, `ChatConversation`
- `AIModelConfig`, `AIUsageStats`
- `PromptOptimizationRequest`, `PromptOptimizationResponse`
- `APIResponse<T>`

## Testing

### API Testing

Run the test script:
```bash
node scripts/test-api.js
```

This will test all endpoints with sample data and cleanup afterwards.

### Manual Testing

1. Start the development server: `npm run dev`
2. Use the test script or tools like Postman/curl
3. Check the browser console and Network tab for debugging

## Configuration

### Environment Variables

Required in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (Optional - for AI features)
GITHUB_TOKEN=your_github_token
GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com
# OR
OPENAI_API_KEY=your_openai_api_key

# AI Model Configuration (Optional)
AI_MODEL=gpt-4o
```

### Supabase Setup

The database schema includes:
- `profiles`: User profiles
- `conversations`: Conversation records
- `messages`: Individual messages
- `prompt_results`: Generated prompt results

### AI Integration

The system supports:
- **GitHub Models** (preferred): Uses GitHub's AI models endpoint
- **OpenAI**: Direct OpenAI API integration

Configure the appropriate API keys and endpoints in your environment variables.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE", // optional
    "details": "Additional error details" // optional
  }
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication errors)
- `404`: Not Found (resource not found)
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error (server errors)

## Next Steps

1. **Frontend Integration**: Connect React components to the API endpoints
2. **Authentication**: Implement user authentication and session management
3. **Rate Limiting**: Add rate limiting for AI endpoints
4. **Caching**: Implement caching for frequently accessed data
5. **Monitoring**: Add logging and monitoring for production
6. **Testing**: Add comprehensive unit and integration tests

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify environment variable configuration
3. Test individual endpoints using the test script
4. Review the database schema and RLS policies in Supabase