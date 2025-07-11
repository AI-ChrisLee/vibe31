'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Image,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  Palette,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  elementType?: 'text' | 'heading' | 'paragraph' | 'div'
}

interface FormatButton {
  icon: React.ReactNode
  command: string
  value?: string
  tooltip: string
}

export function InlineEditor({ 
  initialContent, 
  onSave, 
  onCancel,
  elementType = 'text' 
}: InlineEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Focus editor on mount
    if (editorRef.current) {
      editorRef.current.focus()
      
      // Select all content
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [])

  // Format buttons configuration
  const formatButtons: FormatButton[] = [
    { icon: <Bold className="w-4 h-4" />, command: 'bold', tooltip: 'Bold' },
    { icon: <Italic className="w-4 h-4" />, command: 'italic', tooltip: 'Italic' },
    { icon: <Underline className="w-4 h-4" />, command: 'underline', tooltip: 'Underline' },
    { icon: <AlignLeft className="w-4 h-4" />, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: <AlignCenter className="w-4 h-4" />, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: <AlignRight className="w-4 h-4" />, command: 'justifyRight', tooltip: 'Align Right' },
    { icon: <List className="w-4 h-4" />, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: <ListOrdered className="w-4 h-4" />, command: 'insertOrderedList', tooltip: 'Numbered List' },
  ]

  // Execute formatting command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  // Handle link insertion
  const handleLink = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSelectedText(selection.toString())
      setShowLinkDialog(true)
    }
  }

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      if (selectedText) {
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${selectedText}</a>`)
      } else {
        execCommand('createLink', linkUrl)
      }
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  // Handle save
  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  // Handle paste - clean HTML
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className="inline-editor-container">
      {/* Toolbar */}
      <div className="bg-white border rounded-t-lg p-2 flex items-center gap-1 flex-wrap">
        {/* Format Buttons */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          {formatButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => execCommand(button.command, button.value)}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title={button.tooltip}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* Special Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLink}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => execCommand('undo')}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => execCommand('redo')}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 border-l pl-2 ml-2">
          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className="text-sm border rounded px-2 py-1"
            defaultValue="3"
          >
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Extra Large</option>
          </select>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
            title="Text Color"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "min-h-[100px] p-4 bg-white border-x border-b rounded-b-lg",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset",
          elementType === 'heading' && "text-2xl font-bold",
          elementType === 'paragraph' && "text-base"
        )}
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />

      {/* Action Buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Press ⌘+Enter to save, Esc to cancel
        </span>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Insert Link</h3>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>
              
              {selectedText && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Text
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    {selectedText}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={insertLink}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Insert Link
                </button>
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}