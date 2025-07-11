'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Smartphone, Tablet, Monitor, Edit3, Move, Type, Image, Code, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LivePreviewProps {
  initialContent?: string
  onContentChange?: (content: string) => void
  isEditable?: boolean
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'
type ElementType = 'text' | 'image' | 'button' | 'section'

interface SelectedElement {
  id: string
  type: ElementType
  content: string
  styles?: React.CSSProperties
}

export function LivePreview({ 
  initialContent = '', 
  onContentChange,
  isEditable = true 
}: LivePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const [showCode, setShowCode] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)

  // Device dimensions
  const deviceDimensions = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: '100%', height: '100%' }
  }

  // Initialize iframe document
  useEffect(() => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument || previewRef.current.contentWindow?.document
      if (doc) {
        setPreviewDoc(doc)
        updatePreviewContent(doc, content)
        addInteractivity(doc)
      }
    }
  }, [content])

  // Update preview content
  const updatePreviewContent = (doc: Document, htmlContent: string) => {
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
            }
            .editable {
              outline: 2px dashed transparent;
              transition: all 0.2s;
              cursor: pointer;
            }
            .editable:hover {
              outline-color: #8b5cf6;
              background-color: rgba(139, 92, 246, 0.05);
            }
            .selected {
              outline: 2px solid #8b5cf6 !important;
              position: relative;
            }
            .element-toolbar {
              position: absolute;
              top: -40px;
              left: 0;
              background: #8b5cf6;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              z-index: 1000;
            }
          </style>
        </head>
        <body>
          ${htmlContent || '<div class="editable" data-type="text"><p>Click here to edit content</p></div>'}
        </body>
      </html>
    `)
    doc.close()
  }

  // Add interactivity to preview elements
  const addInteractivity = (doc: Document) => {
    if (!isEditable) return

    // Add click handlers to editable elements
    const editables = doc.querySelectorAll('.editable')
    editables.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        handleElementSelect(el as HTMLElement)
      })
    })

    // Add global click handler to deselect
    doc.body.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.editable')) {
        clearSelection(doc)
      }
    })
  }

  // Handle element selection
  const handleElementSelect = (element: HTMLElement) => {
    if (!previewDoc) return

    // Clear previous selection
    clearSelection(previewDoc)

    // Mark as selected
    element.classList.add('selected')

    // Get element info
    const elementType = element.getAttribute('data-type') as ElementType || 'text'
    const elementId = element.getAttribute('data-id') || `el-${Date.now()}`
    
    setSelectedElement({
      id: elementId,
      type: elementType,
      content: element.innerHTML,
      styles: getComputedStyles(element)
    })

    // Add toolbar
    addElementToolbar(element, elementType)
  }

  // Clear selection
  const clearSelection = (doc: Document) => {
    doc.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'))
    doc.querySelectorAll('.element-toolbar').forEach(el => el.remove())
    setSelectedElement(null)
  }

  // Add element toolbar
  const addElementToolbar = (element: HTMLElement, type: ElementType) => {
    const toolbar = document.createElement('div')
    toolbar.className = 'element-toolbar'
    toolbar.innerHTML = `Editing ${type}`
    element.appendChild(toolbar)
  }

  // Get computed styles
  const getComputedStyles = (element: HTMLElement): React.CSSProperties => {
    const computed = window.getComputedStyle(element)
    return {
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      textAlign: computed.textAlign as any,
      backgroundColor: computed.backgroundColor,
      padding: computed.padding,
      margin: computed.margin
    }
  }

  // Handle inline editing
  const handleInlineEdit = (newContent: string) => {
    if (!selectedElement || !previewDoc) return

    const element = previewDoc.querySelector(`[data-id="${selectedElement.id}"]`)
    if (element) {
      element.innerHTML = newContent
      setSelectedElement({ ...selectedElement, content: newContent })
      
      // Update main content
      const updatedContent = previewDoc.body.innerHTML
      setContent(updatedContent)
      onContentChange?.(updatedContent)
    }
  }

  // Add new element
  const addElement = (type: ElementType) => {
    if (!previewDoc) return

    const newElement = createNewElement(type)
    previewDoc.body.appendChild(newElement)
    
    // Update content
    const updatedContent = previewDoc.body.innerHTML
    setContent(updatedContent)
    onContentChange?.(updatedContent)
    
    // Re-add interactivity
    addInteractivity(previewDoc)
  }

  // Create new element
  const createNewElement = (type: ElementType): HTMLElement => {
    const element = document.createElement('div')
    element.className = 'editable'
    element.setAttribute('data-type', type)
    element.setAttribute('data-id', `el-${Date.now()}`)

    switch (type) {
      case 'text':
        element.innerHTML = '<p>New text element</p>'
        break
      case 'image':
        element.innerHTML = '<img src="https://via.placeholder.com/300x200" alt="Placeholder" style="width: 100%; height: auto;">'
        break
      case 'button':
        element.innerHTML = '<button style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 5px; cursor: pointer;">Click Me</button>'
        break
      case 'section':
        element.innerHTML = '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;"><h2>New Section</h2><p>Section content goes here</p></div>'
        break
    }

    return element
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData('elementType', type)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('elementType') as ElementType
    if (type) {
      addElement(type)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="h-full flex">
      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Device Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDeviceType('mobile')}
                className={cn(
                  "p-2 rounded transition-colors",
                  deviceType === 'mobile' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceType('tablet')}
                className={cn(
                  "p-2 rounded transition-colors",
                  deviceType === 'tablet' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceType('desktop')}
                className={cn(
                  "p-2 rounded transition-colors",
                  deviceType === 'desktop' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Mode Toggle */}
            {isEditable && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors",
                  isEditing 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Editing' : 'Edit Mode'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="View Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => onContentChange?.(content)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Save Changes"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-4 overflow-auto">
          <div 
            className={cn(
              "mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all",
              deviceType === 'mobile' && "max-w-[375px]",
              deviceType === 'tablet' && "max-w-[768px]"
            )}
            style={{
              width: deviceType === 'desktop' ? '100%' : deviceDimensions[deviceType].width,
              height: deviceType === 'desktop' ? '100%' : deviceDimensions[deviceType].height
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {showCode ? (
              <div className="h-full p-4 bg-gray-900 text-gray-100 overflow-auto">
                <pre className="text-sm">
                  <code>{content}</code>
                </pre>
              </div>
            ) : (
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts"
              />
            )}
          </div>
        </div>
      </div>

      {/* Element Panel */}
      {isEditing && (
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Elements</h3>
            <p className="text-sm text-gray-600 mt-1">Drag elements to add them</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Element Library */}
            <div className="space-y-2">
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                className="p-3 border rounded-lg cursor-move hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Text Block</span>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                className="p-3 border rounded-lg cursor-move hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Image</span>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'button')}
                className="p-3 border rounded-lg cursor-move hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded" />
                  <span className="text-sm font-medium">Button</span>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'section')}
                className="p-3 border rounded-lg cursor-move hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Section</span>
                </div>
              </div>
            </div>

            {/* Selected Element Editor */}
            {selectedElement && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">
                  Editing {selectedElement.type}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Content
                    </label>
                    <textarea
                      value={selectedElement.content}
                      onChange={(e) => handleInlineEdit(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows={4}
                    />
                  </div>

                  {/* Style controls would go here */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}