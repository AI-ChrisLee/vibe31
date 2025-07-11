import { useEffect, useCallback } from 'react'

type ShortcutHandler = () => void
type ShortcutMap = Record<string, ShortcutHandler>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Build shortcut string
    const modifiers: string[] = []
    if (event.metaKey || event.ctrlKey) modifiers.push('cmd')
    if (event.shiftKey) modifiers.push('shift')
    if (event.altKey) modifiers.push('alt')
    
    const key = event.key.toLowerCase()
    const shortcut = [...modifiers, key].join('+')
    
    // Check if we have a handler for this shortcut
    const handler = shortcuts[shortcut]
    if (handler) {
      event.preventDefault()
      handler()
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Quick actions hook for common AI commands
export function useQuickActions() {
  const quickActions = [
    {
      id: 'new-funnel',
      label: 'New Funnel',
      shortcut: '⌘⇧F',
      command: 'Create a new sales funnel'
    },
    {
      id: 'write-email',
      label: 'Write Email',
      shortcut: '⌘⇧E',
      command: 'Write an email campaign'
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      shortcut: '⌘⇧R',
      command: 'Generate performance report'
    },
    {
      id: 'analyze-data',
      label: 'Analyze Data',
      shortcut: '⌘⇧A',
      command: 'Analyze client data and provide insights'
    },
    {
      id: 'create-landing',
      label: 'Landing Page',
      shortcut: '⌘⇧L',
      command: 'Create a landing page'
    }
  ]

  return quickActions
}