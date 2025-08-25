'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  MessageSquare, 
  Lightbulb, 
  Target,
  PenTool,
  Code,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WelcomeMessageProps {
  onStartConversation: (template: string) => void
  className?: string
}

const CONVERSATION_STARTERS = [
  {
    title: "Content Creation",
    description: "Blog posts, articles, social media content",
    prompt: "Help me create engaging content about [your topic]. I want to ensure it's informative, well-structured, and captures the reader's attention.",
    icon: PenTool,
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    title: "Code Generation", 
    description: "Functions, scripts, documentation",
    prompt: "I need help writing code for [describe your project]. Please include best practices, error handling, and clear documentation.",
    icon: Code,
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    title: "Analysis & Research",
    description: "Data analysis, summaries, insights", 
    prompt: "Help me analyze [your topic/data]. I need comprehensive insights, key findings, and actionable recommendations.",
    icon: BarChart3,
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    title: "Problem Solving",
    description: "Strategic thinking, troubleshooting",
    prompt: "I'm facing a challenge with [describe your problem]. Help me break it down and develop a systematic approach to solve it.",
    icon: Target,
    color: "bg-orange-50 text-orange-700 border-orange-200"
  }
]

export function WelcomeMessage({ onStartConversation, className }: WelcomeMessageProps) {
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null)

  const handleStarterClick = (prompt: string) => {
    setSelectedStarter(prompt)
    onStartConversation(prompt)
  }

  return (
    <div className={cn("flex flex-col items-center justify-center h-full p-8 text-center", className)}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Prompt Studio</h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            Transform your ideas into optimized prompts through natural conversation. 
            Start by describing what you&apos;d like to create.
          </p>
        </div>

        {/* Quick Tips */}
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              <h3 className="font-medium text-gray-900">Pro Tips</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-1 text-left">
              <p>• Be specific about your goals and target audience</p>
              <p>• Mention any constraints or requirements</p>
              <p>• Ask follow-up questions to refine your prompt</p>
              <p>• Use the generated prompt as a starting point</p>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Starters */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Get Started With These Templates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONVERSATION_STARTERS.map((starter, index) => {
              const Icon = starter.icon
              return (
                <Card 
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md hover:scale-105",
                    "border-2 hover:border-indigo-300",
                    selectedStarter === starter.prompt && "border-indigo-400 shadow-md"
                  )}
                  onClick={() => handleStarterClick(starter.prompt)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg border", starter.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">{starter.title}</CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <CardDescription className="text-xs text-left">
                      {starter.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Custom Start Button */}
        <div className="pt-4">
          <Button 
            onClick={() => onStartConversation('')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Custom Conversation
          </Button>
        </div>

        {/* Features Badge */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Optimization
          </Badge>
          <Badge variant="outline" className="text-xs">
            Save & Organize Prompts
          </Badge>
          <Badge variant="outline" className="text-xs">
            Export Ready Formats
          </Badge>
        </div>
      </div>
    </div>
  )
}