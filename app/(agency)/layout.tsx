'use client'

import DashboardNav from '@/components/dashboard/dashboard-nav'
import { AIProvider, useAI } from '@/components/ai-chat/AIProvider'
import { ChatPanel } from '@/components/ai-chat/ChatPanel'
import { ToolsProvider, useTools } from '@/components/tools/ToolsProvider'
import { ToolsPanel } from '@/components/tools/ToolsPanel'

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AIProvider>
      <ToolsProvider>
        <ChatLayoutContent>{children}</ChatLayoutContent>
      </ToolsProvider>
    </AIProvider>
  )
}

// Wrapper component to use the AI context
function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen: isChatOpen, toggleChat } = useAI()
  const { isOpen: isToolsOpen, toggleTools } = useTools()
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: Chat Panel */}
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
      
      {/* Center: Main content */}
      <div className="flex-1 flex flex-col">
        <DashboardNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Right: Tools Panel */}
      <ToolsPanel isOpen={isToolsOpen} onToggle={toggleTools} />
    </div>
  )
}

