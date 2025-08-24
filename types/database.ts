export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_results: {
        Row: {
          id: string
          conversation_id: string | null
          generated_prompt: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          generated_prompt: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          generated_prompt?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_results_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type PromptResult = Database['public']['Tables']['prompt_results']['Row']
export type PromptResultInsert = Database['public']['Tables']['prompt_results']['Insert']
export type PromptResultUpdate = Database['public']['Tables']['prompt_results']['Update']

// Enum for message roles
export type MessageRole = 'user' | 'assistant'

// Extended types with relationships
export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export interface ConversationWithPromptResults extends Conversation {
  prompt_results: PromptResult[]
}

export interface ConversationComplete extends Conversation {
  messages: Message[]
  prompt_results: PromptResult[]
}

export interface ProfileWithConversations extends Profile {
  conversations: Conversation[]
}