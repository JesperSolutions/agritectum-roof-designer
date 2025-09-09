import { useState } from 'react'
import { RoofComponent } from './RoofComponents'

interface DesignToolsPanelProps {
  components: RoofComponent[]
  onAddComponent: (type: RoofComponent['type'], position: [number, number, number]) => void
  onSelectComponent: (id: string) => void
  onDeleteComponent: (id: string) => void
  onMoveComponent: (id: string, position: [number, number, number]) => void
  selectedComponent?: string
  onToggleTopDownView: () => void
  topDownView: boolean
  onToggleGrid: () => void
  showGrid: boolean
}

export function DesignToolsPanel({
  components,
  onAddComponent,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent: _onMoveComponent,
  selectedComponent,
  onToggleTopDownView,
  topDownView,
  onToggleGrid,
  showGrid
}: DesignToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<RoofComponent['type'] | null>(null)
  const [gridSize, setGridSize] = useState(1)

  const componentTypes = [
    { type: 'hvac', name: 'HVAC Unit', icon: '❄️', color: '#C0C0C0' },
    { type: 'skylight', name: 'Skylight', icon: '🪟', color: '#87CEEB' },
    { type: 'solar', name: 'Solar Panel', icon: '☀️', color: '#1a1a1a' },
    { type: 'vent', name: 'Vent', icon: '💨', color: '#808080' },
    { type: 'antenna', name: 'Antenna', icon: '📡', color: '#C0C0C0' },
    { type: 'water_tank', name: 'Water Tank', icon: '💧', color: '#E0E0E0' }
  ]

  const handleToolSelect = (type: RoofComponent['type']) => {
    setSelectedTool(selectedTool === type ? null : type)
  }

  const handlePlaceComponent = (x: number, z: number) => {
    if (selectedTool) {
      const position: [number, number, number] = [x, 8.1, z] // Place on roof level
      onAddComponent(selectedTool, position)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedComponent) {
      onDeleteComponent(selectedComponent)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.85)',
      padding: '20px',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      minWidth: '300px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        🏭 Industrial Roof Designer
      </h3>

      {/* View Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          View Controls:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onToggleTopDownView}
            style={{
              flex: 1,
              padding: '10px',
              border: topDownView ? '2px solid #4CAF50' : '1px solid #666',
              borderRadius: '6px',
              background: topDownView ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            📐 Top-Down View
          </button>
          <button
            onClick={onToggleGrid}
            style={{
              flex: 1,
              padding: '10px',
              border: showGrid ? '2px solid #2196F3' : '1px solid #666',
              borderRadius: '6px',
              background: showGrid ? '#2196F3' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            📏 Grid
          </button>
        </div>
      </div>

      {/* Grid Size */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Grid Size: {gridSize}m
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.5"
          value={gridSize}
          onChange={(e) => setGridSize(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Component Tools */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Roof Components:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {componentTypes.map(({ type, name, icon }) => (
            <button
              key={type}
              onClick={() => handleToolSelect(type as RoofComponent['type'])}
              style={{
                padding: '10px 8px',
                border: selectedTool === type ? '2px solid #fff' : '1px solid #666',
                borderRadius: '6px',
                background: selectedTool === type ? '#333' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Placement Grid */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Quick Placement:
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '10px',
          borderRadius: '6px'
        }}>
          {Array.from({ length: 25 }, (_, i) => {
            const x = (i % 5) - 2
            const z = Math.floor(i / 5) - 2
            return (
              <button
                key={i}
                onClick={() => handlePlaceComponent(x * 2, z * 2)}
                style={{
                  width: '30px',
                  height: '30px',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  background: selectedTool ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: selectedTool ? 'pointer' : 'not-allowed',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={!selectedTool}
              >
                {selectedTool ? '📍' : '⬜'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Component List */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Placed Components ({components.length}):
        </label>
        <div style={{ 
          maxHeight: '150px', 
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          padding: '8px'
        }}>
          {components.map((component) => (
            <div
              key={component.id}
              onClick={() => onSelectComponent(component.id)}
              style={{
                padding: '6px 8px',
                margin: '2px 0',
                borderRadius: '4px',
                background: selectedComponent === component.id ? '#333' : 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: selectedComponent === component.id ? '1px solid #fff' : '1px solid transparent'
              }}
            >
              <span>
                {componentTypes.find(t => t.type === component.type)?.icon} {component.type}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteComponent(component.id)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff4444',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedComponent}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: selectedComponent ? '#ff4444' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: selectedComponent ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 'bold',
              opacity: selectedComponent ? 1 : 0.5
            }}
          >
            🗑️ Delete Selected
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        fontSize: '11px', 
        color: '#ccc',
        lineHeight: '1.4',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '10px'
      }}>
        <div>🖱️ <strong>Click:</strong> Select component tool</div>
        <div>📍 <strong>Grid:</strong> Click to place components</div>
        <div>📐 <strong>Top-Down:</strong> Better roof view</div>
        <div>🎯 <strong>Select:</strong> Click components to select</div>
      </div>
    </div>
  )
}
