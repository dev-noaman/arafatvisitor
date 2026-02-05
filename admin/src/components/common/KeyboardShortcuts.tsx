import React, { useEffect, useState } from 'react'

export interface KeyboardShortcut {
  keys: string[]
  description: string
  action?: () => void
}

interface KeyboardShortcutsProps {
  isOpen: boolean
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}

export function KeyboardShortcuts({
  isOpen,
  shortcuts,
  onClose,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    // Register shortcuts
    const shortcutMap = new Map<string, () => void>()

    shortcuts.forEach((shortcut) => {
      if (shortcut.action) {
        const key = shortcut.keys.join('+').toLowerCase()
        shortcutMap.set(key, shortcut.action)
      }
    })

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in input fields unless specific
      const isInput = e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement

      const keys: string[] = []
      if (e.ctrlKey || e.metaKey) keys.push('ctrl')
      if (e.shiftKey) keys.push('shift')
      if (e.altKey) keys.push('alt')
      keys.push(e.key.toLowerCase())

      const keyStr = keys.join('+')

      // Handle Escape to open/close help
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
        return
      }

      // Handle Ctrl+? to toggle help
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault()
        // This would be handled by parent
        return
      }

      // Execute registered shortcut
      if (shortcutMap.has(keyStr) && !isInput) {
        e.preventDefault()
        shortcutMap.get(keyStr)?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, onClose, isOpen])

  if (!isOpen) {
    return null
  }

  // Group shortcuts by category
  const groupedShortcuts: Record<string, KeyboardShortcut[]> = {
    Navigation: [],
    Actions: [],
    'Bulk Operations': [],
    Other: [],
  }

  shortcuts.forEach((shortcut) => {
    if (shortcut.description.toLowerCase().includes('navigate')) {
      groupedShortcuts.Navigation.push(shortcut)
    } else if (shortcut.description.toLowerCase().includes('bulk')) {
      groupedShortcuts['Bulk Operations'].push(shortcut)
    } else if (
      shortcut.description.toLowerCase().includes('export') ||
      shortcut.description.toLowerCase().includes('import') ||
      shortcut.description.toLowerCase().includes('save')
    ) {
      groupedShortcuts.Actions.push(shortcut)
    } else {
      groupedShortcuts.Other.push(shortcut)
    }
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              items.length > 0 && (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="grid gap-3">
                    {items.map((shortcut, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{shortcut.description}</p>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <React.Fragment key={keyIdx}>
                              {keyIdx > 0 && (
                                <span className="text-gray-400 px-1">+</span>
                              )}
                              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-900">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Press <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-semibold">Escape</kbd> to close this dialog
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default KeyboardShortcuts
