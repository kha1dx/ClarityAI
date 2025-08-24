#!/usr/bin/env node

/**
 * Test script for Prompt Studio API endpoints
 * Run with: node scripts/test-api.js
 * 
 * Make sure your development server is running on localhost:3000
 */

const TEST_USER_ID = 'test-user-123'
const API_BASE_URL = 'http://localhost:3000/api'

async function testAPI() {
  console.log('🧪 Testing Prompt Studio API endpoints...\n')

  try {
    // Test 1: Create a conversation
    console.log('1️⃣ Testing conversation creation...')
    const createResponse = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Conversation',
        userId: TEST_USER_ID,
        category: 'testing'
      })
    })

    const createResult = await createResponse.json()
    if (!createResult.success) {
      throw new Error(`Failed to create conversation: ${createResult.error?.message}`)
    }

    const conversationId = createResult.data.id
    console.log(`✅ Created conversation: ${conversationId}`)

    // Test 2: Get conversations list
    console.log('\n2️⃣ Testing conversations list...')
    const listResponse = await fetch(`${API_BASE_URL}/conversations?userId=${TEST_USER_ID}`)
    const listResult = await listResponse.json()
    
    if (!listResult.success) {
      throw new Error(`Failed to list conversations: ${listResult.error?.message}`)
    }

    console.log(`✅ Found ${listResult.data.length} conversations`)

    // Test 3: Get specific conversation
    console.log('\n3️⃣ Testing get specific conversation...')
    const getResponse = await fetch(`${API_BASE_URL}/conversations/${conversationId}?userId=${TEST_USER_ID}`)
    const getResult = await getResponse.json()
    
    if (!getResult.success) {
      throw new Error(`Failed to get conversation: ${getResult.error?.message}`)
    }

    console.log(`✅ Retrieved conversation: ${getResult.data.title}`)

    // Test 4: Add a user message
    console.log('\n4️⃣ Testing add message...')
    const userMessageResponse = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'user',
        content: 'Hello, this is a test message!',
        tokensUsed: 10,
        cost: 0.001
      })
    })

    const userMessageResult = await userMessageResponse.json()
    if (!userMessageResult.success) {
      throw new Error(`Failed to add message: ${userMessageResult.error?.message}`)
    }

    console.log(`✅ Added user message: ${userMessageResult.data.id}`)

    // Test 5: Get messages for conversation
    console.log('\n5️⃣ Testing get messages...')
    const messagesResponse = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`)
    const messagesResult = await messagesResponse.json()
    
    if (!messagesResult.success) {
      throw new Error(`Failed to get messages: ${messagesResult.error?.message}`)
    }

    console.log(`✅ Retrieved ${messagesResult.data.length} messages`)

    // Test 6: Update conversation title
    console.log('\n6️⃣ Testing update conversation...')
    const updateResponse = await fetch(`${API_BASE_URL}/conversations/${conversationId}?userId=${TEST_USER_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Test Conversation'
      })
    })

    const updateResult = await updateResponse.json()
    if (!updateResult.success) {
      throw new Error(`Failed to update conversation: ${updateResult.error?.message}`)
    }

    console.log(`✅ Updated conversation title to: ${updateResult.data.title}`)

    // Test 7: Test AI generation (if API keys are configured)
    console.log('\n7️⃣ Testing AI generation...')
    try {
      const aiGenerateResponse = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [
            {
              id: '1',
              role: 'user',
              content: 'Say hello in a friendly way',
              timestamp: new Date().toISOString()
            }
          ],
          userId: TEST_USER_ID
        })
      })

      const aiGenerateResult = await aiGenerateResponse.json()
      if (aiGenerateResult.success) {
        console.log(`✅ Generated AI response (${aiGenerateResult.data.usage.tokens_used} tokens)`)
      } else {
        console.log(`⚠️ AI generation failed: ${aiGenerateResult.error?.message} (this is expected if AI API keys are not configured)`)
      }
    } catch (error) {
      console.log(`⚠️ AI generation test failed: ${error.message} (this is expected if AI API keys are not configured)`)
    }

    // Test 8: Test prompt optimization (if API keys are configured)
    console.log('\n8️⃣ Testing prompt optimization...')
    try {
      const aiOptimizeResponse = await fetch(`${API_BASE_URL}/ai/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [
            {
              id: '1',
              role: 'user',
              content: 'Write something about cats',
              timestamp: new Date().toISOString()
            }
          ],
          userId: TEST_USER_ID,
          optimizationType: 'effectiveness'
        })
      })

      const aiOptimizeResult = await aiOptimizeResponse.json()
      if (aiOptimizeResult.success) {
        console.log(`✅ Optimized prompt (confidence: ${aiOptimizeResult.data.confidence_score})`)
      } else {
        console.log(`⚠️ Prompt optimization failed: ${aiOptimizeResult.error?.message} (this is expected if AI API keys are not configured)`)
      }
    } catch (error) {
      console.log(`⚠️ Prompt optimization test failed: ${error.message} (this is expected if AI API keys are not configured)`)
    }

    // Test 9: Delete conversation (cleanup)
    console.log('\n9️⃣ Testing delete conversation...')
    const deleteResponse = await fetch(`${API_BASE_URL}/conversations/${conversationId}?userId=${TEST_USER_ID}`, {
      method: 'DELETE'
    })

    const deleteResult = await deleteResponse.json()
    if (!deleteResult.success) {
      throw new Error(`Failed to delete conversation: ${deleteResult.error?.message}`)
    }

    console.log(`✅ Deleted conversation: ${conversationId}`)

    console.log('\n🎉 All tests completed successfully!')
    console.log('\nNext steps:')
    console.log('- Configure AI API keys in .env.local to test AI features')
    console.log('- Run the development server: npm run dev')
    console.log('- Test the frontend integration')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Error handling tests
async function testErrorHandling() {
  console.log('\n🔍 Testing error handling...\n')

  try {
    // Test invalid user ID
    console.log('Testing invalid requests...')
    
    const invalidResponse = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '', // Empty title should fail
        userId: TEST_USER_ID
      })
    })

    const invalidResult = await invalidResponse.json()
    if (invalidResult.success) {
      console.log('⚠️ Expected validation error for empty title, but request succeeded')
    } else {
      console.log('✅ Validation error handled correctly for empty title')
    }

    // Test missing user ID
    const missingUserResponse = await fetch(`${API_BASE_URL}/conversations`)
    const missingUserResult = await missingUserResponse.json()
    
    if (missingUserResult.success) {
      console.log('⚠️ Expected error for missing userId, but request succeeded')
    } else {
      console.log('✅ Missing userId error handled correctly')
    }

    // Test non-existent conversation
    const notFoundResponse = await fetch(`${API_BASE_URL}/conversations/non-existent-id?userId=${TEST_USER_ID}`)
    const notFoundResult = await notFoundResponse.json()
    
    if (notFoundResponse.status === 404) {
      console.log('✅ 404 error handled correctly for non-existent conversation')
    } else {
      console.log('⚠️ Expected 404 for non-existent conversation')
    }

    console.log('✅ Error handling tests completed')

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message)
  }
}

// Run the tests
async function runAllTests() {
  await testAPI()
  await testErrorHandling()
}

runAllTests().catch(console.error)