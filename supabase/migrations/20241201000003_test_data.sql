-- Test data for verifying the schema works correctly
-- This migration can be run to test the database structure

-- Note: In a real environment, profiles are created automatically via the trigger
-- when users sign up through Supabase Auth. This is just for testing purposes.

-- Insert test profile (this would normally be created by the trigger)
-- INSERT INTO profiles (id, email, full_name) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User');

-- Insert test conversation
-- INSERT INTO conversations (id, user_id, title) 
-- VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Conversation');

-- Insert test messages
-- INSERT INTO messages (conversation_id, role, content) VALUES
-- ('00000000-0000-0000-0000-000000000002', 'user', 'Hello, I need help creating a prompt'),
-- ('00000000-0000-0000-0000-000000000002', 'assistant', 'I''d be happy to help you create a prompt. What kind of prompt are you looking for?');

-- Insert test prompt result
-- INSERT INTO prompt_results (conversation_id, generated_prompt, metadata) VALUES
-- ('00000000-0000-0000-0000-000000000002', 'You are a helpful AI assistant that...', '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}');

-- Verify the schema by running some test queries
-- These are commented out but can be uncommented to test

-- SELECT 'Testing profiles table' as test_name;
-- SELECT count(*) as profile_count FROM profiles;

-- SELECT 'Testing conversations table' as test_name;
-- SELECT count(*) as conversation_count FROM conversations;

-- SELECT 'Testing messages table' as test_name;
-- SELECT count(*) as message_count FROM messages;

-- SELECT 'Testing prompt_results table' as test_name;
-- SELECT count(*) as prompt_result_count FROM prompt_results;

-- Test the RLS policies (these will only work when executed by authenticated users)
-- SELECT 'Testing RLS - should return user-specific data' as test_name;
-- SELECT * FROM conversations WHERE user_id = auth.uid();

-- Test joins to ensure foreign keys work properly
-- SELECT 'Testing table relationships' as test_name;
-- SELECT 
--   c.title as conversation_title,
--   m.role,
--   m.content,
--   pr.generated_prompt
-- FROM conversations c
-- LEFT JOIN messages m ON c.id = m.conversation_id
-- LEFT JOIN prompt_results pr ON c.id = pr.conversation_id
-- ORDER BY c.created_at DESC, m.created_at ASC;