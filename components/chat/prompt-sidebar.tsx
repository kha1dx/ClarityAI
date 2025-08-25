'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Sparkles, 
  Copy, 
  Save, 
  Download, 
  Share, 
  Edit,
  FileText,
  Tag,
  User,
  Target,
  CheckCircle,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat-store'
import { useToast } from '@/hooks/use-toast'

interface PromptSidebarProps {
  generatedPrompt?: {
    title: string
    content: string
    metadata?: {
      category?: string
      tags?: string[]
      complexity?: 'beginner' | 'intermediate' | 'advanced'
      estimatedTime?: string
    }
  } | null
  onSavePrompt?: (prompt: any) => void
  promptMetadata?: {
    category?: string
    tokensUsed?: number
    estimatedCost?: number
  }
}

const PROMPT_SECTIONS = [
  { key: 'role', label: 'Role', icon: User, description: 'Who you want the AI to be' },
  { key: 'context', label: 'Context', icon: FileText, description: 'Background information' },
  { key: 'task', label: 'Task', icon: Target, description: 'What you want accomplished' },
  { key: 'requirements', label: 'Requirements', icon: CheckCircle, description: 'Specific criteria and constraints' },
  { key: 'output', label: 'Output Format', icon: FileText, description: 'How you want the response structured' }
]

export function PromptSidebar({ generatedPrompt, onSavePrompt, promptMetadata }: PromptSidebarProps) {
  const { activeConversationId, updateConversation } = useChatStore()
  const { toast } = useToast()
  
  const [saveDialog, setSaveDialog] = useState(false)
  const [promptTitle, setPromptTitle] = useState('')
  const [promptCategory, setPromptCategory] = useState('')
  const [promptTags, setPromptTags] = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Initialize edited prompt when generatedPrompt changes
  useState(() => {
    if (generatedPrompt?.content) {
      setEditedPrompt(generatedPrompt.content)
      setPromptTitle(generatedPrompt.title || 'Untitled Prompt')
    }
  })

  const handleCopyPrompt = () => {
    const content = isEditing ? editedPrompt : generatedPrompt?.content || ''
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    })
  }

  const handleSavePrompt = () => {
    if (onSavePrompt && generatedPrompt) {
      const promptData = {
        ...generatedPrompt,
        title: promptTitle,
        content: isEditing ? editedPrompt : generatedPrompt.content,
        metadata: {
          ...generatedPrompt.metadata,
          category: promptCategory,
          tags: promptTags.split(',').map(tag => tag.trim()).filter(Boolean),
          savedAt: new Date().toISOString()
        }
      }
      
      onSavePrompt(promptData)
      
      // Update conversation to mark it has a generated prompt
      if (activeConversationId) {
        updateConversation(activeConversationId, { hasGeneratedPrompt: true })
      }
      
      toast({
        title: "Saved!",
        description: "Prompt saved to your library",
      })
      
      setSaveDialog(false)
      setPromptTitle('')
      setPromptCategory('')
      setPromptTags('')
    }
  }

  const handleDownload = () => {
    const content = isEditing ? editedPrompt : generatedPrompt?.content || ''
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedPrompt?.title || 'prompt'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: "Prompt saved as text file",
    })
  }

  const parsePromptSections = (content: string) => {
    const sections: { [key: string]: string } = {}
    
    // Try to extract sections based on common patterns
    const roleMatch = content.match(/(?:Role|You are|Act as|As a):\s*(.*?)(?=\n\n|\n[A-Z]|$)/s)
    const contextMatch = content.match(/(?:Context|Background|Situation):\s*(.*?)(?=\n\n|\n[A-Z]|$)/s)
    const taskMatch = content.match(/(?:Task|Objective|Goal):\s*(.*?)(?=\n\n|\n[A-Z]|$)/s)
    const reqMatch = content.match(/(?:Requirements|Criteria|Constraints):\s*(.*?)(?=\n\n|\n[A-Z]|$)/s)
    const outputMatch = content.match(/(?:Output|Format|Structure):\s*(.*?)(?=\n\n|\n[A-Z]|$)/s)
    
    if (roleMatch) sections.role = roleMatch[1].trim()
    if (contextMatch) sections.context = contextMatch[1].trim()
    if (taskMatch) sections.task = taskMatch[1].trim()
    if (reqMatch) sections.requirements = reqMatch[1].trim()
    if (outputMatch) sections.output = outputMatch[1].trim()
    
    return sections
  }

  const promptSections = generatedPrompt?.content ? parsePromptSections(generatedPrompt.content) : {}

  return (
    <>
      <div className={cn(
        "flex flex-col h-full bg-white border-l border-gray-200",
        "transition-all duration-300 ease-in-out",
        isOpen ? "w-96" : "w-0 overflow-hidden"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generated Prompt
            </h2>
            
            {generatedPrompt && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {!generatedPrompt ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Prompt Generated</h3>
              <p className="text-sm">
                Start a conversation and use the &quot;Generate Prompt&quot; button to create an optimized prompt based on your discussion.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prompt Title & Metadata */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {generatedPrompt.title}
                    {generatedPrompt.metadata?.complexity && (
                      <Badge variant={
                        generatedPrompt.metadata.complexity === 'beginner' ? 'secondary' :
                        generatedPrompt.metadata.complexity === 'intermediate' ? 'default' : 'destructive'
                      }>
                        {generatedPrompt.metadata.complexity}
                      </Badge>
                    )}
                  </CardTitle>
                  {generatedPrompt.metadata?.tags && (
                    <div className="flex flex-wrap gap-1">
                      {generatedPrompt.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Prompt Sections */}
              {Object.keys(promptSections).length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Prompt Structure</h3>
                  {PROMPT_SECTIONS.map(section => {
                    const content = promptSections[section.key]
                    const Icon = section.icon
                    
                    if (!content) return null
                    
                    return (
                      <Card key={section.key} className="border border-gray-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            {section.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {content}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                /* Full Prompt Content */
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Complete Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                        placeholder="Edit your prompt here..."
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                        {generatedPrompt.content}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => setSaveDialog(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Library
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleCopyPrompt} className="text-sm">
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <Share className="h-3 w-3 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialog} onOpenChange={setSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Prompt to Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                placeholder="Enter prompt title..."
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={promptCategory}
                onChange={(e) => setPromptCategory(e.target.value)}
                placeholder="e.g., Content Creation, Analysis..."
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={promptTags}
                onChange={(e) => setPromptTags(e.target.value)}
                placeholder="e.g., writing, marketing, research..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePrompt}>Save Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}