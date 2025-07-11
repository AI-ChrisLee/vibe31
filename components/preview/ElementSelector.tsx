'use client'

import { useState, useEffect, useCallback } from 'react'
import { MousePointer, Move, Maximize2, Copy, Trash2, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ElementSelectorProps {
  document: Document | null
  onElementSelect?: (element: HTMLElement) => void
  onElementEdit?: (element: HTMLElement) => void
  onElementDelete?: (element: HTMLElement) => void
  onElementDuplicate?: (element: HTMLElement) => void
  isActive?: boolean
}

interface ElementInfo {
  tagName: string
  id?: string
  classes: string[]
  dimensions: { width: number; height: number }
  position: { x: number; y: number }
}

export function ElementSelector({
  document,
  onElementSelect,
  onElementEdit,
  onElementDelete,
  onElementDuplicate,
  isActive = true
}: ElementSelectorProps) {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  // Add selection overlay
  const addOverlay = useCallback((element: HTMLElement, type: 'hover' | 'selected') => {
    if (!document) return

    const rect = element.getBoundingClientRect()
    const overlay = document.createElement('div')
    overlay.className = `element-${type}-overlay`
    overlay.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 9999;
      border: 2px ${type === 'hover' ? 'dashed #8b5cf6' : 'solid #8b5cf6'};
      background: rgba(139, 92, 246, ${type === 'hover' ? '0.1' : '0.05'});
      transition: all 0.2s;
    `
    
    document.body.appendChild(overlay)
    
    // Add label
    const label = document.createElement('div')
    label.className = 'element-label'
    label.style.cssText = `
      position: fixed;
      top: ${rect.top - 28}px;
      left: ${rect.left}px;
      background: #8b5cf6;
      color: white;
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `
    label.textContent = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ').join('.') : ''}`
    
    document.body.appendChild(label)
  }, [document])

  // Remove overlays
  const removeOverlays = useCallback(() => {
    if (!document) return
    
    document.querySelectorAll('.element-hover-overlay, .element-selected-overlay, .element-label')
      .forEach(el => el.remove())
  }, [document])

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || !document) return

    const target = e.target as HTMLElement
    
    // Skip if target is overlay or toolbar
    if (target.classList.contains('element-hover-overlay') || 
        target.classList.contains('element-toolbar')) {
      return
    }

    // Update hovered element
    if (target !== hoveredElement) {
      removeOverlays()
      setHoveredElement(target)
      
      if (target && target !== document.body) {
        addOverlay(target, 'hover')
        
        // Update element info
        const rect = target.getBoundingClientRect()
        setElementInfo({
          tagName: target.tagName,
          id: target.id,
          classes: Array.from(target.classList),
          dimensions: { width: rect.width, height: rect.height },
          position: { x: rect.left, y: rect.top }
        })
      }
    }
  }, [isActive, document, hoveredElement, addOverlay, removeOverlays])

  // Handle click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return

    e.preventDefault()
    e.stopPropagation()

    const target = e.target as HTMLElement
    
    if (target.classList.contains('element-hover-overlay')) {
      return
    }

    removeOverlays()
    setSelectedElement(target)
    addOverlay(target, 'selected')
    
    onElementSelect?.(target)
    setShowTooltip(true)
  }, [isActive, addOverlay, removeOverlays, onElementSelect])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedElement) return

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        onElementDelete?.(selectedElement)
        setSelectedElement(null)
        removeOverlays()
        break
      case 'd':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          onElementDuplicate?.(selectedElement)
        }
        break
      case 'e':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          onElementEdit?.(selectedElement)
        }
        break
      case 'Escape':
        setSelectedElement(null)
        removeOverlays()
        setShowTooltip(false)
        break
    }
  }, [selectedElement, onElementDelete, onElementDuplicate, onElementEdit, removeOverlays])

  // Set up event listeners
  useEffect(() => {
    if (!document || !isActive) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
      removeOverlays()
    }
  }, [document, isActive, handleMouseMove, handleClick, handleKeyDown, removeOverlays])

  // Element toolbar
  if (selectedElement && showTooltip) {
    const rect = selectedElement.getBoundingClientRect()
    
    return (
      <div
        className="element-toolbar fixed bg-white rounded-lg shadow-lg border p-2 flex items-center gap-1 z-[10001]"
        style={{
          top: rect.top - 50,
          left: rect.left
        }}
      >
        <button
          onClick={() => onElementEdit?.(selectedElement)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Edit Element"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onElementDuplicate?.(selectedElement)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Duplicate Element"
        >
          <Copy className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => {
            onElementDelete?.(selectedElement)
            setSelectedElement(null)
            setShowTooltip(false)
            removeOverlays()
          }}
          className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
          title="Delete Element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        <div className="border-l pl-2 ml-1 text-xs text-gray-600">
          {elementInfo && (
            <>
              <span className="font-mono">{elementInfo.tagName.toLowerCase()}</span>
              {elementInfo.id && <span className="text-purple-600">#{elementInfo.id}</span>}
              <span className="text-gray-400 ml-2">
                {Math.round(elementInfo.dimensions.width)}×{Math.round(elementInfo.dimensions.height)}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}

// Hook for element selection
export function useElementSelector(document: Document | null) {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const startSelecting = useCallback(() => {
    setIsSelecting(true)
  }, [])

  const stopSelecting = useCallback(() => {
    setIsSelecting(false)
    setSelectedElement(null)
  }, [])

  const selectElement = useCallback((element: HTMLElement) => {
    setSelectedElement(element)
  }, [])

  return {
    selectedElement,
    isSelecting,
    startSelecting,
    stopSelecting,
    selectElement
  }
}