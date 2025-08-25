import { getServiceRoleClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'
import type { 
  Conversation, 
  ConversationInsert, 
  ConversationUpdate,
  Message,
  MessageInsert,
  PromptResult,
  PromptResultInsert,
  ConversationMessage,
  ConversationWithMessages
} from '@/lib/types'

// Get the service role client for admin operations
const supabase = getServiceRoleClient()

export class ConversationService {
  // Conversation CRUD Operations
  static async createConversation(userId: string, title: string, category?: string): Promise<Conversation> {
    const conversationData: ConversationInsert = {
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    return data
  }

  static async getConversations(userId: string): Promise<ConversationWithMessages[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }

    return data as ConversationWithMessages[]
  }

  static async getConversation(conversationId: string, userId: string): Promise<ConversationWithMessages | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No conversation found
      }
      console.error('Error fetching conversation:', error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    return data as ConversationWithMessages
  }

  static async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<Conversation> {
    const updateData: ConversationUpdate = {
      title,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating conversation title:', error)
      throw new Error(`Failed to update conversation title: ${error.message}`)
    }

    return data
  }

  static async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // First delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
      throw new Error(`Failed to delete messages: ${messagesError.message}`)
    }

    // Then delete all prompt results
    const { error: promptResultsError } = await supabase
      .from('prompt_results')
      .delete()
      .eq('conversation_id', conversationId)

    if (promptResultsError) {
      console.error('Error deleting prompt results:', promptResultsError)
      throw new Error(`Failed to delete prompt results: ${promptResultsError.message}`)
    }

    // Finally delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting conversation:', error)
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }
  }

  // Message Operations
  static async saveMessage(
    conversationId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    tokensUsed: number = 0, 
    cost: number = 0
  ): Promise<Message> {
    const messageData: MessageInsert = {
      conversation_id: conversationId,
      role,
      content,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      console.error('Error saving message:', error)
      throw new Error(`Failed to save message: ${error.message}`)
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return data
  }

  static async getMessage(messageId: string, userId: string): Promise<Message | null> {
    // First verify the message exists and get the conversation_id
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('*, conversations(user_id)')
      .eq('id', messageId)
      .single()

    if (messageError) {
      if (messageError.code === 'PGRST116') return null
      console.error('Error fetching message:', messageError)
      throw new Error(`Failed to fetch message: ${messageError.message}`)
    }

    // Verify the user owns this conversation
    if (messageData.conversations?.user_id !== userId) {
      return null
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No message found
      }
      console.error('Error fetching message:', error)
      throw new Error(`Failed to fetch message: ${error.message}`)
    }

    return data
  }

  static async updateMessage(messageId: string, content: string, userId: string): Promise<Message> {
    // First verify the user owns this message
    const message = await this.getMessage(messageId, userId)
    if (!message) {
      throw new Error('Message not found or access denied')
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating message:', error)
      throw new Error(`Failed to update message: ${error.message}`)
    }

    return data
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('conversations.user_id', userId)

    if (error) {
      console.error('Error deleting message:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  // Prompt Result Operations
  static async savePromptResult(
    conversationId: string, 
    generatedPrompt: string, 
    metadata?: Json
  ): Promise<PromptResult> {
    const promptResultData: PromptResultInsert = {
      conversation_id: conversationId,
      generated_prompt: generatedPrompt,
      metadata,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('prompt_results')
      .insert(promptResultData)
      .select()
      .single()

    if (error) {
      console.error('Error saving prompt result:', error)
      throw new Error(`Failed to save prompt result: ${error.message}`)
    }

    return data
  }

  static async getPromptResults(conversationId: string): Promise<PromptResult[]> {
    const { data, error } = await supabase
      .from('prompt_results')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching prompt results:', error)
      throw new Error(`Failed to fetch prompt results: ${error.message}`)
    }

    return data
  }

  // Utility Methods
  static async generateConversationTitle(messages: ConversationMessage[]): Promise<string> {
    // Find the first user message to generate a title from
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    
    if (!firstUserMessage) {
      return 'New Conversation'
    }

    // Generate a title from the first 50 characters of the first user message
    const title = firstUserMessage.content
      .substring(0, 50)
      .trim()
    
    return title.length === 50 ? `${title}...` : title
  }

  static async updateConversationFromMessages(
    conversationId: string, 
    userId: string, 
    messages: ConversationMessage[]
  ): Promise<void> {
    // Generate a title if the conversation doesn't have a meaningful one
    const conversation = await this.getConversation(conversationId, userId)
    
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.title === 'New Conversation' || !conversation.title) {
      const newTitle = await this.generateConversationTitle(messages)
      await this.updateConversationTitle(conversationId, userId, newTitle)
    }

    // Update the conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', userId)
  }

  // Bulk Operations
  static async saveMultipleMessages(
    conversationId: string, 
    messages: Omit<MessageInsert, 'conversation_id'>[]
  ): Promise<Message[]> {
    const messageData = messages.map(msg => ({
      ...msg,
      conversation_id: conversationId,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()

    if (error) {
      console.error('Error saving multiple messages:', error)
      throw new Error(`Failed to save messages: ${error.message}`)
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  }

  static async getConversationStats(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching conversation stats:', error)
      throw new Error(`Failed to fetch conversation stats: ${error.message}`)
    }

    const totalConversations = data.length

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('id, conversations(user_id)')
      .in('conversation_id', data.map(c => c.id))

    if (messageError) {
      console.error('Error fetching message stats:', messageError)
      throw new Error(`Failed to fetch message stats: ${messageError.message}`)
    }

    const totalMessages = messageData.length

    return {
      totalConversations,
      totalMessages
    }
  }
}