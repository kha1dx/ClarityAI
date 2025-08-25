import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import { getUserIdFromRequest } from '@/lib/auth/server-auth'

// GET /api/messages - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'conversationId parameter is required' } 
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

    // Verify user has access to this conversation
    const conversation = await ConversationService.getConversation(conversationId, userId)
    if (!conversation) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found or access denied' } 
        },
        { status: 404 }
      )
    }

    // Get messages from Supabase
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

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, content, role, tokensUsed = 0, cost = 0 } = body

    // Validate required fields
    if (!conversationId || !content || !role) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'conversationId, content, and role are required' } 
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

    // Verify user has access to this conversation
    const conversation = await ConversationService.getConversation(conversationId, userId)
    if (!conversation) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Conversation not found or access denied' } 
        },
        { status: 404 }
      )
    }

    // Save message to Supabase
    const message = await ConversationService.saveMessage(
      conversationId,
      role as 'user' | 'assistant',
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