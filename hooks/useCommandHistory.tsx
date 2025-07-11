import { useState, useCallback } from 'react'

export interface CommandHistoryItem {
  id: string
  command: string
  result: string
  clientId?: string
  timestamp: Date
}

interface CommandHistoryState {
  items: CommandHistoryItem[]
  currentIndex: number
}

export function useCommandHistory(maxItems = 50) {
  const [history, setHistory] = useState<CommandHistoryState>({
    items: [],
    currentIndex: -1
  })

  const addToHistory = useCallback((item: Omit<CommandHistoryItem, 'id'>) => {
    setHistory(prev => {
      // Remove any items after current index (for redo functionality)
      const newItems = prev.items.slice(0, prev.currentIndex + 1)
      
      // Add new item
      const newItem: CommandHistoryItem = {
        ...item,
        id: `cmd-${Date.now()}`
      }
      newItems.push(newItem)
      
      // Limit history size
      if (newItems.length > maxItems) {
        newItems.shift()
      }
      
      return {
        items: newItems,
        currentIndex: newItems.length - 1
      }
    })
  }, [maxItems])

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1
        }
      }
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.currentIndex < prev.items.length - 1) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1
        }
      }
      return prev
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory({
      items: [],
      currentIndex: -1
    })
  }, [])

  const canUndo = history.currentIndex > 0
  const canRedo = history.currentIndex < history.items.length - 1

  return {
    history,
    addToHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  }
}