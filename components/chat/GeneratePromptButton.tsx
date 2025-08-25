'use client'

import { useState } from 'react'

interface GeneratePromptButtonProps {
  onGeneratePrompt: () => Promise<void>
  disabled?: boolean
  hasEnoughContext?: boolean
  messageCount?: number
}

export default function GeneratePromptButton({ 
  onGeneratePrompt, 
  disabled = false,
  hasEnoughContext = false,
  messageCount = 0
}: GeneratePromptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClick = async () => {
    if (disabled || isGenerating) return
    
    setIsGenerating(true)
    try {
      await onGeneratePrompt()
    } catch (error) {
      console.error('Failed to generate prompt:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Don't show the button if there's not enough context
  if (messageCount < 3) {
    return null
  }

  return (
    <div className="flex justify-center py-4">
      <button
        onClick={handleClick}
        disabled={disabled || isGenerating}
        className={`
          px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
          flex items-center gap-2 shadow-sm hover:shadow-md
          ${hasEnoughContext 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          ${(disabled || isGenerating) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
        `}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating Prompt...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
            {hasEnoughContext ? 'Generate My Prompt!' : 'Generate Prompt'}
          </>
        )}
      </button>
      
      {/* Hint text */}
      {messageCount >= 3 && !hasEnoughContext && (
        <div className="absolute mt-16 text-center">
          <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
            Answer a few more questions for a better prompt
          </p>
        </div>
      )}
      
      {hasEnoughContext && (
        <div className="absolute mt-16 text-center">
          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm">
            Ready to generate your optimized prompt!
          </p>
        </div>
      )}
    </div>
  )
}