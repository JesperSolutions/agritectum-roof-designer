// Advanced undo/redo system for design changes
export interface HistoryState {
  id: string
  timestamp: number
  action: string
  data: any
  description: string
}

export class UndoRedoManager {
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  // Add a new state to history
  pushState(action: string, data: any, description: string): void {
    // Remove any states after current index (when branching)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    const newState: HistoryState = {
      id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      description
    }
    
    this.history.push(newState)
    this.currentIndex = this.history.length - 1
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
  }

  // Undo last action
  undo(): HistoryState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  // Redo next action
  redo(): HistoryState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  // Get current state
  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  // Get history for debugging
  getHistory(): HistoryState[] {
    return [...this.history]
  }

  // Clear all history
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  // Get history summary
  getHistorySummary(): {canUndo: boolean, canRedo: boolean, currentAction: string} {
    const current = this.getCurrentState()
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentAction: current ? current.description : 'No actions'
    }
  }
}

// Action types for better organization
export const ActionTypes = {
  ADD_COMPONENT: 'ADD_COMPONENT',
  DELETE_COMPONENT: 'DELETE_COMPONENT',
  MOVE_COMPONENT: 'MOVE_COMPONENT',
  ROTATE_COMPONENT: 'ROTATE_COMPONENT',
  SCALE_COMPONENT: 'SCALE_COMPONENT',
  CHANGE_MATERIAL: 'CHANGE_MATERIAL',
  BATCH_OPERATION: 'BATCH_OPERATION'
} as const

// Batch operations for multiple changes
export class BatchOperation {
  private operations: Array<{action: string, data: any}> = []
  private description: string

  constructor(description: string) {
    this.description = description
  }

  addOperation(action: string, data: any): void {
    this.operations.push({ action, data })
  }

  execute(historyManager: UndoRedoManager): void {
    if (this.operations.length > 0) {
      historyManager.pushState(
        ActionTypes.BATCH_OPERATION,
        { operations: this.operations },
        this.description
      )
    }
  }
}

