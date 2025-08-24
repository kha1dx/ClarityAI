-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for conversations table
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in own conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from own conversations" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for prompt_results table
CREATE POLICY "Users can view prompt results from own conversations" ON prompt_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = prompt_results.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert prompt results to own conversations" ON prompt_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = prompt_results.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update prompt results in own conversations" ON prompt_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = prompt_results.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prompt results from own conversations" ON prompt_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = prompt_results.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );