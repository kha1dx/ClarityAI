import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation-service'
import type { CreateConversationRequest } from '@/lib/types'

// GET /api/conversations - List conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId parameter is required' } 
        },
        { status: 400 }
      )
    }

    const conversations = await ConversationService.getConversations(userId)

    return NextResponse.json({
      success: true,
      data: conversations,
      meta: {
        total: conversations.length
      }
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch conversations',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body: CreateConversationRequest = await request.json()
    const { title, userId, category } = body

    // Validate required fields
    if (!title || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'title and userId are required' } 
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

    const conversation = await ConversationService.createConversation(userId, title, category)

    return NextResponse.json({
      success: true,
      data: conversation
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to create conversation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}