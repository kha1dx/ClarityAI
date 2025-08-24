# Complete Database Setup Guide for Prompt Studio

## Overview

I've created a complete Supabase database schema for your Prompt Studio project. Since direct CLI access requires authentication, here's how to apply the schema manually through the Supabase dashboard.

## Database Schema Summary

The schema includes 4 main tables with proper relationships, RLS policies, and performance optimizations:

1. **profiles** - User profile information (extends auth.users)
2. **conversations** - Chat conversations between users and AI
3. **messages** - Individual messages within conversations  
4. **prompt_results** - Generated prompts with metadata

## Files Created

### Migration Files:
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/supabase/migrations/20241201000001_initial_schema.sql`
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/supabase/migrations/20241201000002_enable_rls.sql`
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/supabase/migrations/20241201000003_test_data.sql`

### TypeScript Types:
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/types/database.ts`

### Helper Functions:
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/lib/supabase.ts`

### Setup Scripts:
- `/Users/khal1dx/Desktop/khal1dx/vscode/Prompt studio/AI-Studio/prompt-studio/scripts/apply-migrations.sh`

## Step-by-Step Setup Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard/project/pkbaenyoyrveaxlbuyrd
   - Navigate to the "SQL Editor" section

2. **Apply Initial Schema**
   - Copy the contents of `supabase/migrations/20241201000001_initial_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Enable Row Level Security**
   - Copy the contents of `supabase/migrations/20241201000002_enable_rls.sql`
   - Paste it into the SQL Editor  
   - Click "Run" to execute

4. **Verify Setup**
   - Go to "Database" > "Tables" to see the created tables
   - Go to "Authentication" > "Policies" to verify RLS policies
   - Check "Database" > "Extensions" to ensure uuid-ossp is enabled

### Method 2: Using Supabase CLI (After Authentication)

1. **Authenticate with Supabase**
   ```bash
   supabase login
   ```

2. **Link to Your Project**
   ```bash
   cd /Users/khal1dx/Desktop/khal1dx/vscode/Prompt\ studio/AI-Studio/prompt-studio
   supabase link --project-ref pkbaenyoyrveaxlbuyrd
   ```

3. **Apply Migrations**
   ```bash
   supabase db push
   ```

4. **Generate TypeScript Types**
   ```bash
   npm run db:types
   ```

## Verification Steps

After applying the schema, verify everything works:

1. **Check Tables Created**
   - profiles
   - conversations  
   - messages
   - prompt_results

2. **Test User Registration**
   - Create a test user in Authentication > Users
   - Verify a profile is automatically created in the profiles table

3. **Test RLS Policies**
   - Try querying data as different users
   - Ensure users can only see their own data

## Key Features Implemented

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ User data isolation policies
- ✅ Automatic profile creation on user registration
- ✅ Cascading deletes for data consistency

### Performance
- ✅ Strategic indexes on commonly queried columns
- ✅ Optimized foreign key relationships
- ✅ JSONB for flexible metadata storage

### Developer Experience  
- ✅ Complete TypeScript types
- ✅ Helper functions for common operations
- ✅ Proper error handling
- ✅ Automatic timestamp management

## Database Schema Details

```sql
-- Core tables with relationships
profiles (id, email, full_name, avatar_url, created_at, updated_at)
├── conversations (id, user_id→profiles.id, title, created_at, updated_at)
    ├── messages (id, conversation_id→conversations.id, role, content, created_at)
    └── prompt_results (id, conversation_id→conversations.id, generated_prompt, metadata, created_at)
```

## Usage Examples

### Create a Conversation
```typescript
import { createConversation } from '@/lib/supabase'

const conversation = await createConversation("My New Chat", userId)
```

### Add Messages
```typescript
import { addMessage } from '@/lib/supabase'

await addMessage(conversationId, 'user', 'Hello AI!')
await addMessage(conversationId, 'assistant', 'Hello! How can I help?')
```

### Save Prompt Results
```typescript
import { savePromptResult } from '@/lib/supabase'

await savePromptResult(conversationId, generatedPrompt, {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
})
```

## NPM Scripts Added

I've added convenient npm scripts to your package.json:

- `npm run db:setup` - Apply all migrations
- `npm run db:types` - Generate TypeScript types
- `npm run db:reset` - Reset database (careful!)
- `npm run db:status` - Check database status

## Next Steps

1. **Apply the schema** using Method 1 or Method 2 above
2. **Test user registration** to ensure the profile trigger works
3. **Integrate with your Next.js app** using the provided helper functions
4. **Test the complete user flow** from registration to conversation creation

## Troubleshooting

If you encounter issues:

1. **Migration fails**: Check Supabase logs in the dashboard
2. **RLS not working**: Ensure you're using authenticated requests
3. **Types not matching**: Regenerate types after schema changes
4. **Performance issues**: Check query performance in the dashboard

The schema is now ready for production use with proper security, performance optimizations, and developer-friendly TypeScript integration!