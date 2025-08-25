import { NextRequest, NextResponse } from 'next/server'
import { EnhancedConversationService } from '@/lib/services/enhanced-conversation-service'

// PUT /api/conversations/[id]/tags - Update conversation tags
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { id: conversationId } = await params
    const body = await request.json()
    const { tags } = body

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

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'tags must be an array of strings' } 
        },
        { status: 400 }
      )
    }

    // Validate tags
    const validTags = tags.filter(tag => 
      typeof tag === 'string' && 
      tag.trim().length > 0 && 
      tag.length <= 50
    )

    if (validTags.length !== tags.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'All tags must be non-empty strings with maximum 50 characters' } 
        },
        { status: 400 }
      )
    }

    // Limit number of tags
    if (validTags.length > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Maximum 10 tags allowed per conversation' } 
        },
        { status: 400 }
      )
    }

    const conversation = await EnhancedConversationService.updateConversationTags(
      conversationId,
      userId,
      validTags
    )

    return NextResponse.json({
      success: true,
      data: conversation
    })

  } catch (error) {
    console.error('Error updating conversation tags:', error)
    
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
          message: 'Failed to update conversation tags',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/tags - Add tags to conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { id: conversationId } = await params
    const body = await request.json()
    const { tags: newTags } = body

    if (!userId || !conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId parameter and conversation ID are required' } 
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(newTags) || newTags.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'tags must be a non-empty array of strings' } 
        },
        { status: 400 }
      )
    }

    // Get current conversation to merge tags
    const { data: currentConv } = await EnhancedConversationService.supabase
      .from('conversations')
      .select('tags')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single()

    const currentTags = currentConv?.tags || []
    const mergedTags = [...new Set([...currentTags, ...newTags])]

    if (mergedTags.length > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Maximum 10 tags allowed per conversation' } 
        },
        { status: 400 }
      )
    }

    const conversation = await EnhancedConversationService.updateConversationTags(
      conversationId,
      userId,
      mergedTags
    )

    return NextResponse.json({
      success: true,
      data: conversation,
      meta: {
        tagsAdded: newTags,
        totalTags: mergedTags.length
      }
    })

  } catch (error) {
    console.error('Error adding conversation tags:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to add conversation tags',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}