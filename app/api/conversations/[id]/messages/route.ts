import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import type { CreateMessageRequest } from '@/lib/types'

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation ID is required' } 
        },
        { status: 400 }
      )
    }

    const messages = await ConversationService.getMessages(conversationId)

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        total: messages.length,
        conversationId
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch messages',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Add a new message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const body: CreateMessageRequest = await request.json()
    const { role, content, tokensUsed = 0, cost = 0 } = body

    // Validate required fields
    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation ID is required' } 
        },
        { status: 400 }
      )
    }

    if (!role || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'role and content are required' } 
        },
        { status: 400 }
      )
    }

    // Validate role
    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'role must be either "user" or "assistant"' } 
        },
        { status: 400 }
      )
    }

    // Validate content length (reasonable limit)
    if (content.length > 50000) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Content must be 50,000 characters or less' } 
        },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'tokensUsed must be a non-negative number' } 
        },
        { status: 400 }
      )
    }

    if (typeof cost !== 'number' || cost < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'cost must be a non-negative number' } 
        },
        { status: 400 }
      )
    }

    const message = await ConversationService.saveMessage(
      conversationId,
      role,
      content,
      tokensUsed,
      cost
    )

    return NextResponse.json({
      success: true,
      data: message
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating message:', error)
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('foreign key')) {
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
          message: 'Failed to create message',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}