import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import { getUserIdFromRequest } from '@/lib/auth/server-auth'

interface RouteContext {
  params: {
    id: string
  }
}

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const conversationId = context.params.id

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

    const conversation = await ConversationService.getConversation(conversationId, userId)
    
    if (!conversation) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found' } 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: conversation
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// PUT /api/conversations/[id] - Update a conversation
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const conversationId = context.params.id
    const body = await request.json()
    const { title, is_starred, is_archived } = body

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

    // Update title if provided
    if (title !== undefined) {
      if (title.length > 255) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Title must be 255 characters or less' } 
          },
          { status: 400 }
        )
      }
      await ConversationService.updateConversationTitle(conversationId, userId, title)
    }

    // Handle star operation
    if (is_starred !== undefined) {
      await ConversationService.starConversation(conversationId, userId, is_starred)
    }

    // Handle archive operation
    if (is_archived !== undefined) {
      await ConversationService.archiveConversation(conversationId, userId, is_archived)
    }

    // Get updated conversation
    const updatedConversation = await ConversationService.getConversation(conversationId, userId)
    
    if (!updatedConversation) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found after update' } 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedConversation
    })

  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to update conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const conversationId = context.params.id

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

    await ConversationService.deleteConversation(conversationId, userId)

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to delete conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}