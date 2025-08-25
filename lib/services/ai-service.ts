import OpenAI from 'openai'
import type { Json } from '@/types/database'
import type { 
  ConversationMessage, 
  AIModelConfig, 
  AIUsageStats,
  PromptOptimizationResponse 
} from '@/lib/types'

// OpenAI Client Configuration for GitHub Models
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
})

// Default model configuration
const DEFAULT_MODEL_CONFIG: AIModelConfig = {
  model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
}

// Token estimation constants (approximate)
const TOKENS_PER_WORD = 1.3
const COST_PER_1K_TOKENS = 0.002 // Approximate cost, adjust based on actual pricing

export class AIService {
  /**
   * Generate a conversation response using GitHub Models
   */
  static async generateConversationResponse(
    conversationHistory: ConversationMessage[],
    config: Partial<AIModelConfig> = {}
  ): Promise<{
    content: string
    usage: AIUsageStats
  }> {
    const startTime = Date.now()
    const modelConfig = { ...DEFAULT_MODEL_CONFIG, ...config }

    // Validate GitHub token
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    console.log('Using GitHub Models with:', {
      model: modelConfig.model,
      endpoint: "https://models.github.ai/inference",
      tokenLength: process.env.GITHUB_TOKEN?.length || 0,
      envAIModel: process.env.AI_MODEL,
      defaultModel: DEFAULT_MODEL_CONFIG.model
    })

    try {
      // Format conversation history for OpenAI
      const messages = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Add system message for context
      const systemMessage = {
        role: 'system' as const,
        content: `You are a helpful AI assistant that provides thoughtful and accurate responses. 
                 You should be conversational, informative, and helpful while maintaining a professional tone.
                 If you're unsure about something, acknowledge it rather than making up information.`
      }

      const completion = await openai.chat.completions.create({
        model: modelConfig.model,
        messages: [systemMessage, ...messages],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
        top_p: modelConfig.top_p,
        frequency_penalty: modelConfig.frequency_penalty,
        presence_penalty: modelConfig.presence_penalty
      })

      const content = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(content)
      const processingTime = Date.now() - startTime

      const usage: AIUsageStats = {
        tokens_used: tokensUsed,
        estimated_cost: (tokensUsed / 1000) * COST_PER_1K_TOKENS,
        model_used: modelConfig.model,
        processing_time_ms: processingTime
      }

      return {
        content,
        usage
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate an optimized prompt based on conversation history
   */
  static async generateOptimizedPrompt(
    conversationHistory: ConversationMessage[],
    optimizationType: 'clarity' | 'effectiveness' | 'conciseness' = 'effectiveness'
  ): Promise<PromptOptimizationResponse> {
    const startTime = Date.now()

    // Validate GitHub token
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    try {
      // Extract the original prompt (usually the first user message)
      const originalPrompt = conversationHistory.find(msg => msg.role === 'user')?.content || ''
      
      if (!originalPrompt) {
        throw new Error('No user prompt found in conversation history')
      }

      // Create optimization system message based on type
      const optimizationInstructions = {
        clarity: `Analyze the following prompt and make it clearer and more understandable while preserving its intent. 
                 Focus on removing ambiguity, improving structure, and making the language more precise.`,
        effectiveness: `Analyze the following prompt and optimize it for maximum effectiveness. 
                      Focus on making it more specific, actionable, and likely to produce better AI responses.
                      Add context, constraints, or formatting instructions where helpful.`,
        conciseness: `Analyze the following prompt and make it more concise while preserving its full meaning. 
                     Remove redundancy, unnecessary words, and verbose explanations while keeping all essential information.`
      }

      const systemMessage = {
        role: 'system' as const,
        content: `You are an expert at optimizing prompts for AI systems. ${optimizationInstructions[optimizationType]}
                 
                 Please provide:
                 1. An optimized version of the prompt
                 2. A list of specific improvements made
                 3. A confidence score (0-100) for how much better the optimized version is
                 
                 Format your response as JSON:
                 {
                   "optimized_prompt": "...",
                   "improvements": ["improvement 1", "improvement 2", ...],
                   "confidence_score": 85
                 }`
      }

      const messages = [
        systemMessage,
        {
          role: 'user' as const,
          content: `Original prompt: "${originalPrompt}"\n\nConversation context: ${JSON.stringify(conversationHistory.slice(0, 5))}`
        }
      ]

      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL_CONFIG.model,
        messages,
        temperature: 0.3, // Lower temperature for more consistent optimization
        max_tokens: 1500
      })

      const responseContent = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(responseContent)
      const processingTime = Date.now() - startTime

      // Parse the JSON response
      let optimizationResult: Record<string, unknown>
      try {
        optimizationResult = JSON.parse(responseContent)
      } catch (parseError) {
        console.error('Error parsing optimization response:', parseError)
        // Fallback: create a basic optimization response
        optimizationResult = {
          optimized_prompt: originalPrompt,
          improvements: ['Unable to parse optimization suggestions'],
          confidence_score: 0
        }
      }

      const response: PromptOptimizationResponse = {
        original_prompt: originalPrompt,
        optimized_prompt: (optimizationResult.optimized_prompt as string) || originalPrompt,
        improvements: (optimizationResult.improvements as string[]) || [],
        confidence_score: (optimizationResult.confidence_score as number) || 0,
        tokens_used: tokensUsed,
        cost: (tokensUsed / 1000) * COST_PER_1K_TOKENS
      }

      return response
    } catch (error) {
      console.error('Error generating optimized prompt:', error)
      throw new Error(`Failed to generate optimized prompt: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Estimate token count for text (approximation)
   */
  static estimateTokens(text: string): number {
    // Simple word-based estimation - in production, use a proper tokenizer
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount * TOKENS_PER_WORD)
  }

  /**
   * Calculate estimated cost for token usage
   */
  static calculateCost(tokens: number, model: string = DEFAULT_MODEL_CONFIG.model): number {
    // This should be updated based on actual model pricing
    const costPer1K = COST_PER_1K_TOKENS
    return (tokens / 1000) * costPer1K
  }

  /**
   * Validate that the AI service is properly configured
   */
  static validateConfiguration(): boolean {
    const hasApiKey = !!(process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY)
    const hasEndpoint = !!process.env.GITHUB_MODELS_ENDPOINT
    
    if (!hasApiKey) {
      console.error('Missing AI API key configuration')
      return false
    }
    
    return true
  }

  /**
   * Generate a title for a conversation based on its messages
   */
  static async generateConversationTitle(messages: ConversationMessage[]): Promise<string> {
    try {
      const firstFewMessages = messages.slice(0, 3)
      const context = firstFewMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 6 words) for this conversation based on the content. Return only the title, no extra text.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.5,
        max_tokens: 50
      })

      const title = completion.choices[0]?.message?.content?.trim() || 'New Conversation'
      
      // Clean up the title
      return title.replace(/['"]/g, '').substring(0, 60)
    } catch (error) {
      console.error('Error generating conversation title:', error)
      return 'New Conversation'
    }
  }

  /**
   * Track AI usage (placeholder for usage tracking implementation)
   */
  static async trackAIUsage(
    userId: string,
    action: string,
    tokensUsed: number,
    cost: number,
    metadata?: Json
  ): Promise<void> {
    // This would integrate with your usage tracking service
    console.log('AI Usage:', {
      userId,
      action,
      tokensUsed,
      cost,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    // TODO: Implement actual usage tracking to database
    // await UsageTrackingService.track({ userId, action, tokensUsed, cost, metadata })
  }

  /**
   * Check if user has remaining quota for AI operations
   */
  static async checkUserQuota(userId: string): Promise<{ 
    hasQuota: boolean 
    remaining: number
    limit: number
  }> {
    // This would check against your usage limits
    // For now, return a default allowing usage
    return {
      hasQuota: true,
      remaining: 1000,
      limit: 1000
    }
  }
}