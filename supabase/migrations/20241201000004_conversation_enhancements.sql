-- Conversation enhancements migration
-- Adds performance optimizations and additional features

-- Add metadata column for storing conversation settings and context
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add tags column for conversation categorization
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add archived and starred flags
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;

-- Add message count for quick statistics
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Add last_message_at for better ordering
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add metadata and token tracking to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS cost DECIMAL(10,6) DEFAULT 0.0;

-- Add indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_tags ON conversations USING GIN(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN(metadata);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_is_starred ON conversations(is_starred) WHERE is_starred = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_is_archived ON conversations(is_archived) WHERE is_archived = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_metadata ON messages USING GIN(metadata);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_tokens_cost ON messages(tokens_used, cost);

-- Function to update conversation statistics
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count and last_message_at for the conversation
  UPDATE conversations 
  SET 
    message_count = (SELECT COUNT(*) FROM messages WHERE conversation_id = NEW.conversation_id),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update conversation stats when messages are added
DROP TRIGGER IF EXISTS update_conversation_stats_trigger ON messages;
CREATE TRIGGER update_conversation_stats_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

-- Function to handle message deletions
CREATE OR REPLACE FUNCTION handle_message_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count for the conversation
  UPDATE conversations 
  SET 
    message_count = (SELECT COUNT(*) FROM messages WHERE conversation_id = OLD.conversation_id),
    last_message_at = COALESCE(
      (SELECT created_at FROM messages WHERE conversation_id = OLD.conversation_id ORDER BY created_at DESC LIMIT 1),
      NOW()
    ),
    updated_at = NOW()
  WHERE id = OLD.conversation_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for message deletions
DROP TRIGGER IF EXISTS handle_message_deletion_trigger ON messages;
CREATE TRIGGER handle_message_deletion_trigger
  AFTER DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_deletion();

-- Function to get conversation statistics
CREATE OR REPLACE FUNCTION get_conversation_stats(user_id_param UUID)
RETURNS TABLE (
  total_conversations INTEGER,
  total_messages BIGINT,
  total_tokens_used BIGINT,
  total_cost DECIMAL,
  starred_conversations INTEGER,
  archived_conversations INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(c.id)::INTEGER as total_conversations,
    COALESCE(SUM(c.message_count), 0) as total_messages,
    COALESCE(SUM(m.tokens_used), 0) as total_tokens_used,
    COALESCE(SUM(m.cost), 0.0) as total_cost,
    COUNT(c.id) FILTER (WHERE c.is_starred = true)::INTEGER as starred_conversations,
    COUNT(c.id) FILTER (WHERE c.is_archived = true)::INTEGER as archived_conversations
  FROM conversations c
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE c.user_id = user_id_param
  GROUP BY ();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for conversation summaries with enhanced data
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  c.message_count,
  c.is_starred,
  c.is_archived,
  c.tags,
  c.metadata,
  -- Latest message preview
  latest_msg.content as last_message_content,
  latest_msg.role as last_message_role,
  -- Token and cost statistics
  COALESCE(msg_stats.total_tokens, 0) as total_tokens_used,
  COALESCE(msg_stats.total_cost, 0.0) as total_cost
FROM conversations c
LEFT JOIN LATERAL (
  SELECT content, role, created_at
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) latest_msg ON true
LEFT JOIN (
  SELECT 
    conversation_id,
    SUM(tokens_used) as total_tokens,
    SUM(cost) as total_cost
  FROM messages
  GROUP BY conversation_id
) msg_stats ON c.id = msg_stats.conversation_id;

-- Grant permissions on the view
GRANT SELECT ON conversation_summaries TO authenticated;

-- RLS policy for the view
CREATE POLICY "Users can view own conversation summaries" ON conversation_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Function to search conversations by content
CREATE OR REPLACE FUNCTION search_conversations(
  user_id_param UUID,
  search_query TEXT,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.id,
    c.title,
    c.created_at,
    c.last_message_at,
    c.message_count,
    -- Simple relevance scoring based on title and message content matches
    (
      CASE WHEN c.title ILIKE '%' || search_query || '%' THEN 2.0 ELSE 0.0 END +
      COUNT(*) FILTER (WHERE m.content ILIKE '%' || search_query || '%') * 1.0
    )::REAL as relevance_score
  FROM conversations c
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE c.user_id = user_id_param
    AND (
      c.title ILIKE '%' || search_query || '%' 
      OR EXISTS (
        SELECT 1 FROM messages msg 
        WHERE msg.conversation_id = c.id 
        AND msg.content ILIKE '%' || search_query || '%'
      )
    )
  GROUP BY c.id, c.title, c.created_at, c.last_message_at, c.message_count
  HAVING COUNT(*) FILTER (WHERE m.content ILIKE '%' || search_query || '%') > 0 
         OR c.title ILIKE '%' || search_query || '%'
  ORDER BY relevance_score DESC, c.last_message_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_conversation_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_conversations(UUID, TEXT, INTEGER, INTEGER) TO authenticated;