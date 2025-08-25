import { NextRequest, NextResponse } from 'next/server'
import { EnhancedConversationService, ConversationSearchOptions } from '@/lib/services/enhanced-conversation-service'

// GET /api/conversations/enhanced - Enhanced conversation listing with filters, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const query = searchParams.get('query')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const isStarred = searchParams.get('isStarred') === 'true' ? true : 
                     searchParams.get('isStarred') === 'false' ? false : undefined
    const isArchived = searchParams.get('isArchived') === 'true' ? true :
                      searchParams.get('isArchived') === 'false' ? false : undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') as 'created_at' | 'updated_at' | 'last_message_at' | 'title' || 'last_message_at'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId parameter is required' } 
        },
        { status: 400 }
      )
    }

    const options: ConversationSearchOptions = {
      query,
      tags,
      isStarred,
      isArchived,
      limit,
      offset,
      sortBy,
      sortOrder
    }

    // If there's a search query, use search function, otherwise use filtered retrieval
    let conversations
    if (query) {
      conversations = await EnhancedConversationService.searchConversations(
        userId,
        query,
        limit,
        offset
      )
    } else {
      conversations = await EnhancedConversationService.getConversationsWithFilters(
        userId,
        options
      )
    }

    return NextResponse.json({
      success: true,
      data: conversations,
      meta: {
        total: conversations.length,
        limit,
        offset,
        hasMore: conversations.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching enhanced conversations:', error)
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

// PATCH /api/conversations/enhanced - Bulk operations on conversations
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, operation, conversationIds, updates } = body

    if (!userId || !operation || !conversationIds?.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'userId, operation, and conversationIds are required' } 
        },
        { status: 400 }
      )
    }

    let result

    switch (operation) {
      case 'bulk_update':
        if (!updates) {
          return NextResponse.json(
            { 
              success: false, 
              error: { message: 'updates object is required for bulk_update operation' } 
            },
            { status: 400 }
          )
        }
        result = await EnhancedConversationService.bulkUpdateConversations(
          conversationIds,
          userId,
          updates
        )
        break

      case 'star':
        result = await Promise.all(
          conversationIds.map(id => 
            EnhancedConversationService.toggleConversationStar(id, userId, true)
          )
        )
        break

      case 'unstar':
        result = await Promise.all(
          conversationIds.map(id => 
            EnhancedConversationService.toggleConversationStar(id, userId, false)
          )
        )
        break

      case 'archive':
        result = await Promise.all(
          conversationIds.map(id => 
            EnhancedConversationService.toggleConversationArchive(id, userId, true)
          )
        )
        break

      case 'unarchive':
        result = await Promise.all(
          conversationIds.map(id => 
            EnhancedConversationService.toggleConversationArchive(id, userId, false)
          )
        )
        break

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Invalid operation. Supported: bulk_update, star, unstar, archive, unarchive' } 
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        operation,
        affected: conversationIds.length
      }
    })

  } catch (error) {
    console.error('Error performing bulk operation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to perform bulk operation',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}