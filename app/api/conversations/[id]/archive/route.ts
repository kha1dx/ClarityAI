import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import { getUserIdFromRequest } from '@/lib/auth/server-auth'

interface RouteContext {
  params: {
    id: string
  }
}

// POST /api/conversations/[id]/archive - Archive/unarchive a conversation
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const conversationId = context.params.id
    const body = await request.json()
    const { isArchived } = body

    if (typeof isArchived !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'isArchived must be a boolean value' } 
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

    const updatedConversation = await ConversationService.archiveConversation(
      conversationId, 
      userId, 
      isArchived
    )

    return NextResponse.json({
      success: true,
      data: updatedConversation,
      message: isArchived ? 'Conversation archived' : 'Conversation unarchived'
    })

  } catch (error) {
    console.error('Error archiving conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to archive/unarchive conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}