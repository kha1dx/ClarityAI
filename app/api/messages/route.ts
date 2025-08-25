import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for demo purposes
// In production, this would be a real database
const messageStore: Record<string, any[]> = {}

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

    // Get messages from in-memory store
    const messages = messageStore[conversationId] || []

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
    const { conversationId, content, role, userId } = body

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

    // Create message and save to in-memory store
    const message = {
      id: `msg_${Date.now()}`,
      conversationId,
      content,
      role,
      userId,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Initialize conversation array if it doesn't exist
    if (!messageStore[conversationId]) {
      messageStore[conversationId] = []
    }

    // Add message to the store
    messageStore[conversationId].push(message)

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