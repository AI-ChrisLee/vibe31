export interface DOMOperation {
  type: 'add' | 'remove' | 'update' | 'move' | 'style'
  target: string // CSS selector or element ID
  data?: any
}

export interface ElementUpdate {
  content?: string
  attributes?: Record<string, string>
  styles?: React.CSSProperties
  classes?: string[]
}

export class DOMManipulator {
  private document: Document
  private history: DOMOperation[] = []
  private historyIndex: number = -1

  constructor(document: Document) {
    this.document = document
  }

  // Execute a DOM operation
  execute(operation: DOMOperation): boolean {
    try {
      switch (operation.type) {
        case 'add':
          this.addElement(operation.target, operation.data)
          break
        case 'remove':
          this.removeElement(operation.target)
          break
        case 'update':
          this.updateElement(operation.target, operation.data)
          break
        case 'move':
          this.moveElement(operation.target, operation.data)
          break
        case 'style':
          this.styleElement(operation.target, operation.data)
          break
      }

      // Add to history
      this.addToHistory(operation)
      return true
    } catch (error) {
      console.error('DOM operation failed:', error)
      return false
    }
  }

  // Add element
  private addElement(parentSelector: string, elementData: {
    tag: string
    id?: string
    classes?: string[]
    content?: string
    attributes?: Record<string, string>
    position?: 'append' | 'prepend' | 'before' | 'after'
    referenceSelector?: string
  }) {
    const parent = this.document.querySelector(parentSelector)
    if (!parent) throw new Error(`Parent element not found: ${parentSelector}`)

    const element = this.document.createElement(elementData.tag)
    
    if (elementData.id) element.id = elementData.id
    if (elementData.classes) element.className = elementData.classes.join(' ')
    if (elementData.content) element.innerHTML = elementData.content
    
    if (elementData.attributes) {
      Object.entries(elementData.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }

    // Position element
    switch (elementData.position) {
      case 'prepend':
        parent.prepend(element)
        break
      case 'before':
        if (elementData.referenceSelector) {
          const ref = this.document.querySelector(elementData.referenceSelector)
          ref?.parentNode?.insertBefore(element, ref)
        }
        break
      case 'after':
        if (elementData.referenceSelector) {
          const ref = this.document.querySelector(elementData.referenceSelector)
          ref?.parentNode?.insertBefore(element, ref.nextSibling)
        }
        break
      default:
        parent.appendChild(element)
    }
  }

  // Remove element
  private removeElement(selector: string) {
    const element = this.document.querySelector(selector)
    if (!element) throw new Error(`Element not found: ${selector}`)
    
    element.remove()
  }

  // Update element
  private updateElement(selector: string, update: ElementUpdate) {
    const element = this.document.querySelector(selector) as HTMLElement
    if (!element) throw new Error(`Element not found: ${selector}`)

    if (update.content !== undefined) {
      element.innerHTML = update.content
    }

    if (update.attributes) {
      Object.entries(update.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }

    if (update.styles) {
      Object.assign(element.style, update.styles)
    }

    if (update.classes) {
      element.className = update.classes.join(' ')
    }
  }

  // Move element
  private moveElement(selector: string, moveData: {
    targetSelector: string
    position: 'before' | 'after' | 'append' | 'prepend'
  }) {
    const element = this.document.querySelector(selector)
    const target = this.document.querySelector(moveData.targetSelector)
    
    if (!element || !target) {
      throw new Error('Element or target not found')
    }

    switch (moveData.position) {
      case 'before':
        target.parentNode?.insertBefore(element, target)
        break
      case 'after':
        target.parentNode?.insertBefore(element, target.nextSibling)
        break
      case 'prepend':
        target.prepend(element)
        break
      case 'append':
        target.appendChild(element)
        break
    }
  }

  // Style element
  private styleElement(selector: string, styles: React.CSSProperties) {
    const element = this.document.querySelector(selector) as HTMLElement
    if (!element) throw new Error(`Element not found: ${selector}`)

    Object.assign(element.style, styles)
  }

  // Add to history
  private addToHistory(operation: DOMOperation) {
    // Remove any operations after current index
    this.history = this.history.slice(0, this.historyIndex + 1)
    
    // Add new operation
    this.history.push(operation)
    this.historyIndex++

    // Limit history size
    if (this.history.length > 50) {
      this.history.shift()
      this.historyIndex--
    }
  }

  // Undo operation
  undo(): boolean {
    if (this.historyIndex < 0) return false
    
    // Implement undo logic based on operation type
    const operation = this.history[this.historyIndex]
    // ... undo implementation
    
    this.historyIndex--
    return true
  }

  // Redo operation
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) return false
    
    this.historyIndex++
    const operation = this.history[this.historyIndex]
    return this.execute(operation)
  }

  // Get element info
  getElementInfo(selector: string) {
    const element = this.document.querySelector(selector) as HTMLElement
    if (!element) return null

    const computed = this.document.defaultView?.getComputedStyle(element)
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      classes: Array.from(element.classList),
      content: element.innerHTML,
      attributes: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value
        return acc
      }, {} as Record<string, string>),
      styles: computed ? {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        padding: computed.padding,
        margin: computed.margin,
        width: computed.width,
        height: computed.height
      } : {}
    }
  }

  // Find elements by criteria
  findElements(criteria: {
    tag?: string
    class?: string
    attribute?: { name: string; value?: string }
    contains?: string
  }): Element[] {
    let selector = criteria.tag || '*'
    
    if (criteria.class) {
      selector += `.${criteria.class}`
    }
    
    if (criteria.attribute) {
      selector += `[${criteria.attribute.name}${
        criteria.attribute.value ? `="${criteria.attribute.value}"` : ''
      }]`
    }

    const elements = Array.from(this.document.querySelectorAll(selector))
    
    if (criteria.contains) {
      return elements.filter(el => 
        el.textContent?.toLowerCase().includes(criteria.contains!.toLowerCase())
      )
    }

    return elements
  }

  // Export HTML
  exportHTML(): string {
    return this.document.documentElement.outerHTML
  }

  // Import HTML
  importHTML(html: string) {
    this.document.open()
    this.document.write(html)
    this.document.close()
  }
}