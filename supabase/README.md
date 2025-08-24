# Supabase Database Setup for Prompt Studio

This directory contains the complete database schema and migration files for the Prompt Studio application.

## Database Schema Overview

The database consists of four main tables:

### 1. `profiles` (extends auth.users)
- Stores user profile information
- Automatically created when a user signs up via Supabase Auth
- Links to the built-in `auth.users` table

### 2. `conversations`
- Stores chat conversations between users and the AI
- Each conversation belongs to a specific user
- Has a title and timestamps

### 3. `messages`
- Stores individual messages within conversations
- Can be either 'user' or 'assistant' messages
- Links to a specific conversation

### 4. `prompt_results`
- Stores generated prompts from conversations
- Includes metadata about the generation process
- Links to the conversation that generated it

## Features

- **Row Level Security (RLS)**: All tables have RLS policies to ensure users can only access their own data
- **Automatic Timestamps**: Tables include `created_at` and `updated_at` timestamps with automatic updates
- **Foreign Key Constraints**: Proper relationships between tables with cascading deletes
- **Indexes**: Optimized indexes for common query patterns
- **Triggers**: Automatic profile creation and timestamp updates

## Migration Files

1. `20241201000001_initial_schema.sql` - Creates the core database structure
2. `20241201000002_enable_rls.sql` - Enables Row Level Security and creates policies
3. `20241201000003_test_data.sql` - Test queries and sample data (commented out)

## Setup Instructions

### Option 1: Using the Migration Script
```bash
cd /path/to/prompt-studio
./scripts/apply-migrations.sh
```

### Option 2: Manual Setup via Supabase CLI
```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref pkbaenyoyrveaxlbuyrd

# Apply migrations
supabase db push
```

### Option 3: Manual Setup via Supabase Dashboard
1. Open your Supabase dashboard at https://supabase.com/dashboard/project/pkbaenyoyrveaxlbuyrd
2. Go to the SQL Editor
3. Run the contents of each migration file in order

## Verification Steps

After applying the migrations, verify the setup:

1. **Check Tables**: Go to Database > Tables in your Supabase dashboard
2. **Check RLS Policies**: Go to Authentication > Policies
3. **Test User Registration**: Create a test user to ensure the profile trigger works
4. **Test Data Operations**: Try creating conversations and messages

## TypeScript Integration

The TypeScript types are available in `/types/database.ts` and include:
- Complete database schema types
- Helper types for easier development
- Extended types with relationships

## Helper Functions

The `/lib/supabase.ts` file includes utility functions:
- `getCurrentUserProfile()` - Get the current user's profile
- `createConversation()` - Create a new conversation
- `addMessage()` - Add a message to a conversation
- `savePromptResult()` - Save a generated prompt
- `getConversationWithMessages()` - Get conversation with all messages
- `getUserConversations()` - Get all user conversations

## Security Features

- **Row Level Security**: Users can only access their own data
- **Automatic Profile Creation**: Profiles are created automatically on user registration
- **Cascading Deletes**: Related data is properly cleaned up when conversations are deleted
- **Input Validation**: Database constraints ensure data integrity

## Performance Optimizations

- **Indexes**: Strategic indexes on commonly queried columns
- **Foreign Keys**: Proper relationships for query optimization  
- **Timestamp Indexes**: Optimized for chronological queries
- **JSONB**: Efficient storage for metadata

## Troubleshooting

### Common Issues

1. **Migration Fails**: Ensure you have the correct project ID and are logged in to Supabase CLI
2. **RLS Policies Not Working**: Check that you're using the authenticated Supabase client
3. **Profile Not Created**: Verify the trigger is enabled and working

### Useful Commands

```bash
# Check current database status
supabase db remote show

# Generate TypeScript types
supabase gen types typescript --project-id pkbaenyoyrveaxlbuyrd --schema public

# Reset database (WARNING: This will delete all data)
supabase db reset

# View database logs
supabase logs db
```

## Environment Variables Required

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://pkbaenyoyrveaxlbuyrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```