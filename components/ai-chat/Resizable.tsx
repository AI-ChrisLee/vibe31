'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResizableProps {
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  children: React.ReactNode
  className?: string
}

export function Resizable({
  defaultWidth = 30,
  minWidth = 20,
  maxWidth = 50,
  children,
  className
}: ResizableProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const container = containerRef.current
      if (!container) return

      const newWidth = (e.clientX / window.innerWidth) * 100
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}%` }}
      className={cn("relative flex-shrink-0", className)}
    >
      {children}
      {/* Resize handle */}
      <div
        className={cn(
          "absolute top-0 right-0 w-1 h-full cursor-col-resize",
          "hover:bg-gray-300 transition-colors",
          isResizing && "bg-gray-300"
        )}
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  )
}