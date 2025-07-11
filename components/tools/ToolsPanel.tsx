'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Wrench, Layout, Code, Database, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolsPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function ToolsPanel({ isOpen, onToggle }: ToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'preview'>('tools')

  const tools = [
    { icon: Layout, name: 'Page Builder', description: 'Drag and drop page editor' },
    { icon: Code, name: 'Code Editor', description: 'Edit HTML/CSS/JS directly' },
    { icon: Database, name: 'Data Manager', description: 'Manage your database' },
    { icon: Globe, name: 'Domain Settings', description: 'Configure custom domains' },
  ]

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed right-4 bottom-4 z-50",
          "w-12 h-12 rounded-full",
          "bg-black text-white",
          "flex items-center justify-center",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200"
        )}
        aria-label={isOpen ? "Close tools" : "Open tools"}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
      </button>

      {/* Tools panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[400px]",
          "bg-white border-l",
          "transform transition-transform duration-300 ease-in-out",
          "z-40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="border-b">
          <div className="p-4">
            <h2 className="font-semibold text-lg">Tools & Preview</h2>
          </div>
          
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('tools')}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === 'tools' 
                  ? "text-black border-b-2 border-black" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Tools
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === 'preview' 
                  ? "text-black border-b-2 border-black" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tools' ? (
            <div className="p-4 space-y-3">
              {tools.map((tool, index) => (
                <button
                  key={index}
                  className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <tool.icon className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
                <p className="text-gray-500">Preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}