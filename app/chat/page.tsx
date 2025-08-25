'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ChatLayout } from '@/components/chat/chat-layout'
import type { User } from '@supabase/supabase-js'

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedPrompt] = useState<string>('')
  const [selectedCategory] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSavePrompt = async (title: string, category: string) => {
    if (!user || !generatedPrompt) return

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          content: generatedPrompt,
          category,
          tokensUsed: Math.floor(generatedPrompt.length / 4),
          cost: (generatedPrompt.length / 4) * 0.00003
        })
      })

      const data = await response.json()
      if (data.success) {
        console.log('Prompt saved successfully:', data.prompt)
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <ChatLayout
        generatedPrompt={generatedPrompt}
        onSavePrompt={handleSavePrompt}
        promptMetadata={{
          category: selectedCategory,
          tokensUsed: Math.floor(generatedPrompt.length / 4),
          estimatedCost: (generatedPrompt.length / 4) * 0.00003
        }}
      />
    </div>
  )
}