import { NextRequest, NextResponse } from 'next/server'
import { EnhancedConversationService } from '@/lib/services/enhanced-conversation-service'

// GET /api/conversations/tags - Get user's popular tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId parameter is required' } 
        },
        { status: 400 }
      )
    }

    const tags = await EnhancedConversationService.getUserTags(userId, limit)

    return NextResponse.json({
      success: true,
      data: tags,
      meta: {
        total: tags.length,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching user tags:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch user tags',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}