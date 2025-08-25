import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/services/ai-service'
import type { GenerateAIRequest } from '@/lib/types'

// POST /api/ai/generate - Generate AI response for conversation
export async function POST(request: NextRequest) {
  try {
    // Validate AI service configuration
    if (!AIService.validateConfiguration()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'AI service is not properly configured',
            code: 'AI_CONFIG_ERROR'
          }
        },
        { status: 500 }
      )
    }

    const body: GenerateAIRequest = await request.json()
    const { conversationHistory, userId, model, temperature, maxTokens } = body

    // Validate required fields
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'conversationHistory is required and must be an array' }
        },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'userId is required' }
        },
        { status: 400 }
      )
    }

    // Validate conversation history format
    for (const message of conversationHistory) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Each message must have role and content fields' }
          },
          { status: 400 }
        )
      }

      if (!['user', 'assistant'].includes(message.role)) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Message role must be either "user" or "assistant"' }
          },
          { status: 400 }
        )
      }
    }

    // Check if conversation history is not empty
    if (conversationHistory.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Conversation history cannot be empty' }
        },
        { status: 400 }
      )
    }

    // Check user quota (if implemented)
    const quotaCheck = await AIService.checkUserQuota(userId)
    if (!quotaCheck.hasQuota) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Usage limit exceeded',
            code: 'QUOTA_EXCEEDED',
            details: {
              remaining: quotaCheck.remaining,
              limit: quotaCheck.limit
            }
          }
        },
        { status: 429 }
      )
    }

    // Prepare AI model configuration - only include defined values
    const modelConfig: any = {}
    if (model) modelConfig.model = model
    if (temperature !== undefined) modelConfig.temperature = temperature
    if (maxTokens !== undefined) modelConfig.max_tokens = maxTokens

    // Generate AI response
    const response = await AIService.generateConversationResponse(
      conversationHistory,
      modelConfig
    )

    // Track AI usage
    await AIService.trackAIUsage(
      userId,
      'generate_response',
      response.usage.tokens_used,
      response.usage.estimated_cost,
      {
        model: response.usage.model_used,
        processing_time_ms: response.usage.processing_time_ms,
        message_count: conversationHistory.length
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        usage: response.usage,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating AI response:', error)

    // Handle specific AI service errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'AI service authentication failed',
              code: 'AI_AUTH_ERROR'
            }
          },
          { status: 401 }
        )
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'AI service rate limit exceeded',
              code: 'AI_RATE_LIMIT'
            }
          },
          { status: 429 }
        )
      }

      if (error.message.includes('content policy')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Content violates AI service policy',
              code: 'CONTENT_POLICY_VIOLATION'
            }
          },
          { status: 422 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to generate AI response',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}