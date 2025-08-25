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
  temperature: 0.8, // Slightly higher for more natural conversation
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0.3, // Reduce repetition
  presence_penalty: 0.3  // Encourage variety
}

// Token estimation constants (approximate)
const TOKENS_PER_WORD = 1.3
const COST_PER_1K_TOKENS = 0.002

// Conversation state tracker for better flow
const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  UNDERSTANDING: 'understanding',
  EXPLORING: 'exploring',
  REFINING: 'refining',
  FINALIZING: 'finalizing'
}

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

    // Validate GitHub token or provide fallback
    if (!process.env.GITHUB_TOKEN) {
      console.warn('GITHUB_TOKEN not found, using mock responses')
      return this.generateMockResponse(conversationHistory, modelConfig)
    }

    try {
      // Format conversation history for OpenAI
      const messages = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Determine conversation stage based on message count
      const messageCount = conversationHistory.filter(m => m.role === 'user').length
      const stage = this.determineConversationStage(messageCount, conversationHistory)

      // Enhanced system message for prompt engineering assistant
      const systemMessage = {
        role: 'system' as const,
        content: `You are Clara, a specialized AI assistant focused on helping users create effective prompts through conversational guidance.

CORE BEHAVIOR:
- Keep responses SHORT (1-2 sentences maximum)
- Ask ONE focused question at a time
- Be friendly but concise
- Guide conversation toward gathering prompt requirements

CONVERSATION STAGES:
Stage: ${stage}
${this.getStageSpecificGuidance(stage)}

RESPONSE RULES:
1. NO long explanations or multiple questions
2. Focus on extracting: goal, context, audience, format, constraints
3. Reference what they've shared to show you're listening
4. When you have enough info (after 4-6 exchanges), suggest generating their prompt

EXAMPLE RESPONSES:
- "What's the main goal you want to achieve?"
- "Got it! Who's your target audience?"
- "That sounds great! Any specific format you need?"
- "Perfect! I think I have enough to create your prompt now."

Current conversation stage: ${stage}
Remember: Be helpful, concise, and focused on prompt creation.`
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
   * Determine the current stage of conversation
   */
  static determineConversationStage(
    userMessageCount: number, 
    history: ConversationMessage[]
  ): string {
    if (userMessageCount === 0) return CONVERSATION_STAGES.GREETING
    if (userMessageCount === 1) return CONVERSATION_STAGES.UNDERSTANDING
    if (userMessageCount <= 3) return CONVERSATION_STAGES.EXPLORING
    if (userMessageCount <= 5) return CONVERSATION_STAGES.REFINING
    
    // Check if we have enough context to generate a prompt
    const hasEnoughContext = this.assessContextCompleteness(history)
    if (hasEnoughContext || userMessageCount > 6) {
      return CONVERSATION_STAGES.FINALIZING
    }
    
    return CONVERSATION_STAGES.EXPLORING
  }

  /**
   * Get stage-specific guidance for the AI
   */
  static getStageSpecificGuidance(stage: string): string {
    const guidance: Record<string, string> = {
      [CONVERSATION_STAGES.GREETING]: `
        - Ask: "What would you like to create a prompt for today?"
        - Keep it short and focused on getting their goal`,
      
      [CONVERSATION_STAGES.UNDERSTANDING]: `
        - Ask about their main objective or what they want to accomplish
        - Example: "What's the main goal you want to achieve?"`,
      
      [CONVERSATION_STAGES.EXPLORING]: `
        - Ask about context, audience, or specific requirements
        - Examples: "Who's your target audience?" or "Any specific format needed?"`,
      
      [CONVERSATION_STAGES.REFINING]: `
        - Ask about constraints, tone, or missing details
        - Example: "Any specific tone or style preferences?"`,
      
      [CONVERSATION_STAGES.FINALIZING]: `
        - Suggest generating their prompt
        - Say: "Perfect! I have enough information to create your prompt now. Ready to generate it?"`
    }
    
    return guidance[stage] || guidance[CONVERSATION_STAGES.EXPLORING]
  }

  /**
   * Assess if we have enough context to generate a good prompt
   */
  static assessContextCompleteness(history: ConversationMessage[]): boolean {
    const userMessages = history.filter(m => m.role === 'user').map(m => m.content).join(' ')
    
    // Check for key elements that make a good prompt
    const hasGoal = /want|need|create|build|write|make|help/i.test(userMessages)
    const hasContext = userMessages.length > 100 // Reasonable amount of text
    const hasSpecifics = /specific|example|like|format|style/i.test(userMessages)
    
    return hasGoal && hasContext && (hasSpecifics || history.length > 8)
  }

  /**
   * Generate an optimized prompt based on conversation history
   */
  static async generateOptimizedPrompt(
    conversationHistory: ConversationMessage[],
    optimizationType: 'clarity' | 'effectiveness' | 'conciseness' = 'effectiveness'
  ): Promise<PromptOptimizationResponse> {
    const startTime = Date.now()

    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    try {
      // Extract all context from the conversation
      const userMessages = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ')
      
      const assistantMessages = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content)
        .join(' ')

      const systemMessage = {
        role: 'system' as const,
        content: `You are an expert prompt engineer. Create a comprehensive, well-structured prompt based on the conversation.

REQUIRED STRUCTURE:
**Role/Persona:** [Define who the AI should act as]
**Context:** [Background information and situation]
**Task:** [Specific objective and what needs to be done]
**Requirements:** [Detailed specifications, constraints, format]
**Output Format:** [How the response should be structured]

Format your response as JSON:
{
  "optimized_prompt": "**Role/Persona:** You are...\n\n**Context:** ...\n\n**Task:** ...\n\n**Requirements:**\n- Requirement 1\n- Requirement 2\n\n**Output Format:**\n- Format specification",
  "improvements": ["Added clear role definition", "Structured requirements", "Specified output format"],
  "confidence_score": 85
}

Make the prompt comprehensive, actionable, and professionally structured.`
      }

      const messages = [
        systemMessage,
        {
          role: 'user' as const,
          content: `Based on this conversation, create an optimized prompt:

User's inputs: ${userMessages}

Context from discussion: ${assistantMessages}

Create a prompt that captures everything discussed in a clear, actionable format.`
        }
      ]

      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL_CONFIG.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000 // More tokens for comprehensive prompts
      })

      const responseContent = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(responseContent)

      // Parse the JSON response
      let optimizationResult: Record<string, unknown>
      try {
        optimizationResult = JSON.parse(responseContent)
      } catch (parseError) {
        console.error('Error parsing optimization response:', parseError)
        // Fallback: extract the prompt from the response
        optimizationResult = {
          optimized_prompt: responseContent,
          improvements: ['Structured based on conversation', 'Included all discussed elements'],
          confidence_score: 75
        }
      }

      const response: PromptOptimizationResponse = {
        original_prompt: userMessages.substring(0, 200) + '...',
        optimized_prompt: (optimizationResult.optimized_prompt as string) || userMessages,
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
   * Generate a friendly conversation starter
   */
  static async generateConversationStarter(): Promise<string> {
    const starters = [
      "Hey there! 👋 I'm here to help you create an amazing prompt. What are you working on today?",
      "Hi! Ready to turn your ideas into a perfect prompt? Tell me what you'd like to create!",
      "Hello! I'm excited to help you craft something awesome. What's on your mind?",
      "Hey! Let's create a prompt that gets you exactly what you need. What are you hoping to accomplish?",
      "Hi there! I love helping people bring their ideas to life. What kind of prompt do you need today?"
    ]
    
    return starters[Math.floor(Math.random() * starters.length)]
  }

  /**
   * Generate a title for a conversation based on its messages
   */
  static async generateConversationTitle(messages: ConversationMessage[]): Promise<string> {
    try {
      const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || ''
      const topic = firstUserMessage.substring(0, 100)
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, friendly title (max 5 words) that captures the essence of what the user wants to create. Be specific and descriptive.'
          },
          {
            role: 'user',
            content: `Create a title for: "${topic}"`
          }
        ],
        temperature: 0.5,
        max_tokens: 20
      })

      const title = completion.choices[0]?.message?.content?.trim() || 'New Chat'
      return title.replace(/['"]/g, '').substring(0, 40)
    } catch (error) {
      console.error('Error generating conversation title:', error)
      return 'New Chat'
    }
  }

  // ... rest of the existing methods remain the same ...

  static estimateTokens(text: string): number {
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount * TOKENS_PER_WORD)
  }

  static calculateCost(tokens: number, model: string = DEFAULT_MODEL_CONFIG.model): number {
    const costPer1K = COST_PER_1K_TOKENS
    return (tokens / 1000) * costPer1K
  }

  static validateConfiguration(): boolean {
    const hasApiKey = !!(process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY)
    
    if (!hasApiKey) {
      console.error('Missing AI API key configuration')
      return false
    }
    
    return true
  }

  static async trackAIUsage(
    userId: string,
    action: string,
    tokensUsed: number,
    cost: number,
    metadata?: Json
  ): Promise<void> {
    console.log('AI Usage:', {
      userId,
      action,
      tokensUsed,
      cost,
      metadata,
      timestamp: new Date().toISOString()
    })
  }

  static async checkUserQuota(userId: string): Promise<{ 
    hasQuota: boolean 
    remaining: number
    limit: number
  }> {
    return {
      hasQuota: true,
      remaining: 1000,
      limit: 1000
    }
  }

  /**
   * Generate a mock response when AI service is not available
   */
  static async generateMockResponse(
    conversationHistory: ConversationMessage[],
    config: Partial<AIModelConfig>
  ): Promise<{ content: string; usage: AIUsageStats }> {
    const startTime = Date.now()
    const userMessage = conversationHistory[conversationHistory.length - 1]
    
    // Simple mock responses based on conversation stage
    const messageCount = conversationHistory.filter(m => m.role === 'user').length
    let mockResponse = ''
    
    if (messageCount === 1) {
      mockResponse = "That sounds interesting! Could you tell me more about what you're trying to achieve?"
    } else if (messageCount === 2) {
      mockResponse = "Great! Who is your target audience for this?"
    } else if (messageCount === 3) {
      mockResponse = "Perfect! Do you have any specific format or style requirements?"
    } else if (messageCount >= 4) {
      mockResponse = "Excellent! I think I have enough information to help you create a great prompt. Would you like me to generate an optimized prompt now?"
    } else {
      mockResponse = "I understand. Can you share more details about your requirements?"
    }
    
    // Add a slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
    
    const processingTime = Date.now() - startTime
    const estimatedTokens = this.estimateTokens(mockResponse)
    
    return {
      content: mockResponse,
      usage: {
        tokens_used: estimatedTokens,
        estimated_cost: (estimatedTokens / 1000) * COST_PER_1K_TOKENS,
        model_used: 'mock-gpt-4o-mini',
        processing_time_ms: processingTime
      }
    }
  }
}