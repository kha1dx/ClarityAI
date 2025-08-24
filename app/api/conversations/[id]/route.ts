import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = params.id

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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = params.id
    
    const body = await request.json()
    const { title } = body

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

    if (!title) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'title is required' } 
        },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.length > 255) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Title must be 255 characters or less' } 
        },
        { status: 400 }
      )
    }

    const conversation = await ConversationService.updateConversationTitle(conversationId, userId, title)

    return NextResponse.json({
      success: true,
      data: conversation
    })

  } catch (error) {
    console.error('Error updating conversation:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found' } 
        },
        { status: 404 }
      )
    }

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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = params.id

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

    await ConversationService.deleteConversation(conversationId, userId)

    return NextResponse.json({
      success: true,
      data: { message: 'Conversation deleted successfully' }
    })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found' } 
        },
        { status: 404 }
      )
    }

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