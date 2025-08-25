import { NextRequest, NextResponse } from 'next/server'
import { EnhancedConversationService } from '@/lib/services/enhanced-conversation-service'

// GET /api/conversations/[id]/analytics - Get conversation usage analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { id: conversationId } = await params

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId parameter is required' } 
        },
        { status: 400 }
      )
    }

    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation ID is required' } 
        },
        { status: 400 }
      )
    }

    const analytics = await EnhancedConversationService.getConversationUsageAnalytics(
      conversationId,
      userId
    )

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Error fetching conversation analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch conversation analytics',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}