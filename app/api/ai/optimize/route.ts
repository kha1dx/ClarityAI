import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/services/ai-service'
import { ConversationService } from '@/lib/services/conversation-service'
import type { OptimizePromptRequest } from '@/lib/types'

// POST /api/ai/optimize - Optimize a prompt based on conversation history
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

    const body: OptimizePromptRequest = await request.json()
    const { conversationHistory, userId, optimizationType = 'effectiveness' } = body

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

    // Validate optimization type
    const validOptimizationTypes = ['clarity', 'effectiveness', 'conciseness']
    if (optimizationType && !validOptimizationTypes.includes(optimizationType)) {
      return NextResponse.json(
        {
          success: false,
          error: { 
            message: `optimizationType must be one of: ${validOptimizationTypes.join(', ')}` 
          }
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

    // Check if conversation history contains at least one user message
    const hasUserMessage = conversationHistory.some(msg => msg.role === 'user')
    if (!hasUserMessage) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Conversation history must contain at least one user message' }
        },
        { status: 400 }
      )
    }

    // Check user quota
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

    // Generate optimized prompt
    const optimizationResponse = await AIService.generateOptimizedPrompt(
      conversationHistory,
      optimizationType
    )

    // Track AI usage for optimization
    await AIService.trackAIUsage(
      userId,
      'optimize_prompt',
      optimizationResponse.tokens_used,
      optimizationResponse.cost,
      {
        optimization_type: optimizationType,
        confidence_score: optimizationResponse.confidence_score,
        improvements_count: optimizationResponse.improvements.length,
        original_length: optimizationResponse.original_prompt.length,
        optimized_length: optimizationResponse.optimized_prompt.length
      }
    )

    // Log the optimization results for debugging
    console.log('Prompt optimization completed:', {
      userId,
      optimizationType,
      confidenceScore: optimizationResponse.confidence_score,
      improvementsCount: optimizationResponse.improvements.length,
      tokensUsed: optimizationResponse.tokens_used,
      cost: optimizationResponse.cost
    })

    return NextResponse.json({
      success: true,
      data: {
        ...optimizationResponse,
        optimization_type: optimizationType,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error optimizing prompt:', error)

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

      if (error.message.includes('No user prompt found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'No user message found in conversation history',
              code: 'NO_USER_PROMPT'
            }
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to optimize prompt',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}