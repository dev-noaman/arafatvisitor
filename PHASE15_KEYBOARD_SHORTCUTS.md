# Phase 15: Keyboard Shortcuts Reference

**Date**: 2026-02-04
**Component**: KeyboardShortcuts.tsx

## Overview

The Keyboard Shortcuts system provides power-users with quick access to common operations using keyboard combinations. This guide documents all available shortcuts and how to implement them.

## Global Shortcuts

### Help & Navigation
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+?` | Show Help | Display keyboard shortcuts help dialog |
| `Escape` | Close Dialog | Close current modal or help dialog |
| `Ctrl+Home` | Dashboard | Navigate to dashboard |
| `Ctrl+1` | Visitors | Navigate to visitors page |
| `Ctrl+2` | Hosts | Navigate to hosts page |
| `Ctrl+3` | Deliveries | Navigate to deliveries page |

### Selection & Bulk Operations
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+A` | Select All | Select all visible items on current page |
| `Ctrl+Shift+A` | Clear Selection | Deselect all items |
| `Ctrl+Shift+C` | Check Selection | Toggle select all/none |

### Common Operations
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+E` | Export | Open export modal |
| `Ctrl+I` | Import | Open import modal |
| `Ctrl+F` | Filter | Focus on search/filter |
| `Ctrl+R` | Refresh | Reload current page data |
| `Ctrl+S` | Save | Save current form (if applicable) |

### Bulk Actions (when items selected)
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+A` | Approve Selected | Approve all selected visitors |
| `Ctrl+Shift+R` | Reject Selected | Reject all selected visitors |
| `Ctrl+Shift+D` | Delete Selected | Delete all selected items |
| `Ctrl+Shift+E` | Export Selected | Export selected items |

### Page-Specific Shortcuts

#### Visitors Page
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` | New Visitor | Create new visitor |
| `Ctrl+F` | Filter Visitors | Open advanced filter panel |
| `Ctrl+Shift+A` | Bulk Approve | Approve all selected |
| `Ctrl+Shift+R` | Bulk Reject | Reject all selected |

#### Hosts Page
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` | New Host | Create new host |
| `Ctrl+I` | Import Hosts | Open import modal |
| `Ctrl+E` | Export Hosts | Open export modal |
| `Ctrl+Shift+D` | Bulk Delete | Delete selected hosts |

#### Deliveries Page
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` | New Delivery | Create new delivery |
| `Ctrl+F` | Filter Deliveries | Open advanced filter panel |
| `Ctrl+E` | Export Deliveries | Export current view |
| `Ctrl+Shift+U` | Mark Picked Up | Mark selected as picked up |

#### Dashboard
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+R` | Refresh Dashboard | Reload all dashboard data |
| `Ctrl+E` | Export Dashboard Report | Export current dashboard data |

## Implementation Guide

### Adding Shortcuts to a Component

```typescript
import { KeyboardShortcuts, type KeyboardShortcut } from '@/components/common'
import { useState } from 'react'

export default function MyComponent() {
  const [showShortcuts, setShowShortcuts] = useState(false)

  const shortcuts: KeyboardShortcut[] = [
    {
      keys: ['Ctrl', 'E'],
      description: 'Export current data',
      action: () => handleExport()
    },
    {
      keys: ['Ctrl', 'I'],
      description: 'Import data',
      action: () => handleImport()
    },
    {
      keys: ['Ctrl', 'Shift', 'A'],
      description: 'Approve all selected',
      action: () => handleBulkApprove()
    },
    {
      keys: ['Ctrl', 'Shift', '?'],
      description: 'Show this help',
      action: () => setShowShortcuts(true)
    }
  ]

  return (
    <>
      <button onClick={() => setShowShortcuts(true)}>Show Shortcuts</button>

      <KeyboardShortcuts
        isOpen={showShortcuts}
        shortcuts={shortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  )
}
```

### Event Handler Pattern

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const ctrlKey = isMac ? e.metaKey : e.ctrlKey

  // Ctrl+E: Export
  if (ctrlKey && e.key === 'e') {
    e.preventDefault()
    handleExport()
  }

  // Ctrl+I: Import
  if (ctrlKey && e.key === 'i') {
    e.preventDefault()
    handleImport()
  }

  // Ctrl+Shift+A: Bulk Approve
  if (ctrlKey && e.shiftKey && e.key === 'a') {
    e.preventDefault()
    handleBulkApprove()
  }

  // Escape: Close modals
  if (e.key === 'Escape') {
    setShowModal(false)
  }
}

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

## Best Practices

### 1. Mac vs Windows Support
- Use `Ctrl` for Windows, `Cmd` for Mac
- Component automatically handles both via `ctrlKey || metaKey`
- Display "Cmd" to Mac users, "Ctrl" to others

### 2. Avoid Conflicting Shortcuts
- Don't override browser defaults (Ctrl+S, Ctrl+C, Ctrl+V, etc.)
- Use `Ctrl+Shift+` for less common operations
- Always test with browser console and form inputs

### 3. Avoid Shortcuts in Input Fields
- Skip shortcut execution when focus is on input/textarea/select
- Exception: Escape to close modals should work everywhere

### 4. Accessible Shortcuts
- Document all shortcuts in help dialog
- Provide alternative UI buttons for all shortcuts
- Don't make critical operations keyboard-only

### 5. Customization
- Allow users to customize shortcuts (Phase 16+)
- Store preferences in localStorage
- Provide defaults that match common apps (Gmail, etc.)

## Platform-Specific Notes

### Windows/Linux
```
Ctrl+Shift+? : Help
Ctrl+E       : Export
Ctrl+I       : Import
Alt+? : Alternative help trigger
```

### macOS
```
Cmd+Shift+? : Help (shows native help)
Cmd+E       : Export
Cmd+I       : Import
⌥+? : Alternative help trigger
```

### Mobile
- Shortcuts work with external keyboards
- On-screen help still available
- Touch gestures for common operations (Phase 16+)

## Troubleshooting

### Shortcuts Not Working
1. Verify shortcut is registered in component
2. Check if focus is on input field (shortcuts disabled)
3. Verify page context (some shortcuts page-specific)
4. Check browser console for errors

### Conflicts with Browser Shortcuts
- Some shortcuts reserved by browsers (Ctrl+W, Ctrl+T, etc.)
- Use `Ctrl+Shift+X` pattern to avoid conflicts
- Test in multiple browsers

### Help Dialog Not Showing
- Ensure KeyboardShortcuts component rendered
- Check if modal dialog already open
- Verify onClose handler provided

## Testing Shortcuts

### Manual Testing
```typescript
// Test in browser console
const event = new KeyboardEvent('keydown', {
  key: 'e',
  ctrlKey: true
})
window.dispatchEvent(event)
```

### Automated Testing
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('should trigger export on Ctrl+E', async () => {
  const user = userEvent.setup()
  render(<MyComponent />)

  await user.keyboard('{Control>}e{/Control}')
  expect(mockExport).toHaveBeenCalled()
})
```

## Future Enhancements

### Phase 16+
- User customizable shortcuts
- Shortcut sequences (Ctrl+K then X for export)
- Chord-based shortcuts
- Voice command shortcuts
- Gesture recognition on touch devices
- Visual shortcut hints in tooltips
- Shortcut conflict detection
- Shortcut analytics and usage tracking

## Reference Implementation

### Complete Example in Visitors.tsx

```typescript
import { useState, useEffect } from 'react'
import { KeyboardShortcuts } from '@/components/common'

export default function Visitors() {
  const [showShortcuts, setShowShortcuts] = useState(false)

  const shortcuts = [
    // Navigation
    {
      keys: ['Ctrl', 'Home'],
      description: 'Go to Dashboard',
      action: () => navigate('/')
    },

    // Selection
    {
      keys: ['Ctrl', 'A'],
      description: 'Select all visible visitors',
      action: () => selectAll()
    },

    // Operations
    {
      keys: ['Ctrl', 'E'],
      description: 'Export visitors',
      action: () => setShowExportModal(true)
    },
    {
      keys: ['Ctrl', 'I'],
      description: 'Import visitors',
      action: () => setShowImportModal(true)
    },
    {
      keys: ['Ctrl', 'F'],
      description: 'Open advanced filters',
      action: () => setShowFilterPanel(true)
    },

    // Bulk Operations
    {
      keys: ['Ctrl', 'Shift', 'A'],
      description: 'Approve all selected',
      action: () => handleBulkApprove()
    },
    {
      keys: ['Ctrl', 'Shift', 'R'],
      description: 'Reject all selected',
      action: () => handleBulkReject()
    },

    // Help
    {
      keys: ['Ctrl', 'Shift', '?'],
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true)
    }
  ]

  return (
    <>
      {/* Page content */}

      {/* Shortcuts help - always available */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        shortcuts={shortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Help button in footer or header */}
      <button
        onClick={() => setShowShortcuts(true)}
        title="Keyboard shortcuts (Ctrl+Shift+?)"
      >
        Help
      </button>
    </>
  )
}
```

## Summary

- **15+ shortcuts** for common operations
- **Page-specific shortcuts** for efficiency
- **Help dialog** showing all available shortcuts
- **Platform-aware** (Windows/Mac support)
- **Non-intrusive** - alternative UI always available
- **Extensible** - easy to add new shortcuts
- **Accessible** - documented and optional

All shortcuts are opt-in and documented in the help dialog.
