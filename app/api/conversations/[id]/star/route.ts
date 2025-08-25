import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import { getUserIdFromRequest } from '@/lib/auth/server-auth'

interface RouteContext {
  params: {
    id: string
  }
}

// POST /api/conversations/[id]/star - Star/unstar a conversation
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const conversationId = context.params.id
    const body = await request.json()
    const { isStarred } = body

    if (typeof isStarred !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'isStarred must be a boolean value' } 
        },
        { status: 400 }
      )
    }

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Authentication required' } 
        },
        { status: 401 }
      )
    }

    const updatedConversation = await ConversationService.starConversation(
      conversationId, 
      userId, 
      isStarred
    )

    return NextResponse.json({
      success: true,
      data: updatedConversation,
      message: isStarred ? 'Conversation starred' : 'Conversation unstarred'
    })

  } catch (error) {
    console.error('Error starring conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to star/unstar conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}