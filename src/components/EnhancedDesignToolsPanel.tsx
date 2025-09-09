import { useState } from 'react'
import { RoofComponent } from './RoofComponents'
import { UndoRedoManager, ActionTypes } from '../lib/history/undo-redo'
import { BillOfMaterials, PerformanceMetrics } from '../lib/analytics/cost-estimation'
import { getWeatherData, generateWeatherRecommendations } from '../lib/analytics/weather-solar'

interface EnhancedDesignToolsPanelProps {
  components: RoofComponent[]
  onAddComponent: (type: RoofComponent['type'], position: [number, number, number]) => void
  onSelectComponent: (id: string) => void
  onDeleteComponent: (id: string) => void
  onMoveComponent: (id: string, position: [number, number, number]) => void
  onRotateComponent: (id: string, rotation: [number, number, number]) => void
  onScaleComponent: (id: string, scale: [number, number, number]) => void
  selectedComponent?: string
  onToggleTopDownView: () => void
  topDownView: boolean
  onToggleGrid: () => void
  showGrid: boolean
  onShowReport: () => void
  onShowWeatherAnalysis: () => void
  onShowMapsIntegration: () => void
  historyManager: UndoRedoManager
  bom: BillOfMaterials
  metrics: PerformanceMetrics
}

export function EnhancedDesignToolsPanel({
  components,
  onAddComponent,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent: _onMoveComponent,
  onRotateComponent: _onRotateComponent,
  onScaleComponent: _onScaleComponent,
  selectedComponent,
  onToggleTopDownView,
  topDownView,
  onToggleGrid,
  showGrid,
  onShowReport,
  onShowWeatherAnalysis,
  onShowMapsIntegration,
  historyManager,
  bom,
  metrics
}: EnhancedDesignToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<RoofComponent['type'] | null>(null)
  const [weatherLocation, setWeatherLocation] = useState('New York')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const componentTypes = [
    { type: 'hvac', name: 'HVAC Unit', icon: '❄️' },
    { type: 'skylight', name: 'Skylight', icon: '🪟' },
    { type: 'solar', name: 'Solar Panel', icon: '☀️' },
    { type: 'vent', name: 'Vent', icon: '💨' },
    { type: 'antenna', name: 'Antenna', icon: '📡' },
    { type: 'water_tank', name: 'Water Tank', icon: '💧' }
  ]

  const weatherData = getWeatherData(weatherLocation)
  const weatherRecommendations = weatherData ? generateWeatherRecommendations(weatherData, components.map(c => ({ type: c.type, area: 1 }))) : []

  const handleToolSelect = (type: RoofComponent['type']) => {
    setSelectedTool(selectedTool === type ? null : type)
  }

  const handlePlaceComponent = (x: number, z: number) => {
    if (selectedTool) {
      const position: [number, number, number] = [x, 8.1, z]
      onAddComponent(selectedTool, position)
      
      // Add to history
      historyManager.pushState(
        ActionTypes.ADD_COMPONENT,
        { type: selectedTool, position },
        `Added ${selectedTool} at (${x}, ${z})`
      )
    }
  }

  const handleUndo = () => {
    const state = historyManager.undo()
    if (state) {
      // Apply undo logic based on action type
      console.log('Undo:', state.description)
    }
  }

  const handleRedo = () => {
    const state = historyManager.redo()
    if (state) {
      // Apply redo logic based on action type
      console.log('Redo:', state.description)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedComponent) {
      onDeleteComponent(selectedComponent)
      historyManager.pushState(
        ActionTypes.DELETE_COMPONENT,
        { id: selectedComponent },
        `Deleted ${selectedComponent}`
      )
    }
  }

  const handleDuplicateSelected = () => {
    if (selectedComponent) {
      const component = components.find(c => c.id === selectedComponent)
      if (component) {
        const newPosition: [number, number, number] = [
          component.position[0] + 2,
          component.position[1],
          component.position[2] + 2
        ]
        onAddComponent(component.type, newPosition)
        historyManager.pushState(
          ActionTypes.ADD_COMPONENT,
          { type: component.type, position: newPosition },
          `Duplicated ${component.type}`
        )
      }
    }
  }

  const handleSelectAll = () => {
    // Select all components
    components.forEach(c => onSelectComponent(c.id))
  }

  const handleClearSelection = () => {
    onSelectComponent('')
  }

  const historySummary = historyManager.getHistorySummary()

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      minWidth: '320px',
      maxHeight: '90vh',
      overflowY: 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        🏭 Enhanced Roof Designer
      </h3>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px',
        marginBottom: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
            ${bom.totalCost.toFixed(0)}
          </div>
          <div style={{ fontSize: '11px', color: '#ccc' }}>Total Cost</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196F3' }}>
            {components.length}
          </div>
          <div style={{ fontSize: '11px', color: '#ccc' }}>Components</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF9800' }}>
            {metrics.energyEfficiency.toFixed(0)}%
          </div>
          <div style={{ fontSize: '11px', color: '#ccc' }}>Efficiency</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#9C27B0' }}>
            {metrics.totalArea.toFixed(0)}
          </div>
          <div style={{ fontSize: '11px', color: '#ccc' }}>Sq Ft</div>
        </div>
      </div>

      {/* Undo/Redo Controls */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={handleUndo}
            disabled={!historySummary.canUndo}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: historySummary.canUndo ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: historySummary.canUndo ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              opacity: historySummary.canUndo ? 1 : 0.5
            }}
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!historySummary.canRedo}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: historySummary.canRedo ? '#2196F3' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: historySummary.canRedo ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              opacity: historySummary.canRedo ? 1 : 0.5
            }}
          >
            ↷ Redo
          </button>
        </div>
        <div style={{ fontSize: '11px', color: '#ccc', textAlign: 'center' }}>
          {historySummary.currentAction}
        </div>
      </div>

      {/* View Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          View & Tools:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onToggleTopDownView}
            style={{
              padding: '8px 12px',
              border: topDownView ? '2px solid #4CAF50' : '1px solid #666',
              borderRadius: '6px',
              background: topDownView ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            📐 Top-Down
          </button>
          <button
            onClick={onToggleGrid}
            style={{
              padding: '8px 12px',
              border: showGrid ? '2px solid #2196F3' : '1px solid #666',
              borderRadius: '6px',
              background: showGrid ? '#2196F3' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            📏 Grid
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: '8px 12px',
              border: showAdvanced ? '2px solid #FF9800' : '1px solid #666',
              borderRadius: '6px',
              background: showAdvanced ? '#FF9800' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            ⚙️ Advanced
          </button>
        </div>
      </div>

      {/* Weather Location */}
      {showAdvanced && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            Weather Location:
          </label>
          <select
            value={weatherLocation}
            onChange={(e) => setWeatherLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <option value="New York">New York, NY</option>
            <option value="Los Angeles">Los Angeles, CA</option>
            <option value="Chicago">Chicago, IL</option>
            <option value="Miami">Miami, FL</option>
            <option value="Seattle">Seattle, WA</option>
          </select>
          {weatherRecommendations.length > 0 && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '11px', 
              color: '#FFD700',
              background: 'rgba(255, 215, 0, 0.1)',
              padding: '8px',
              borderRadius: '4px'
            }}>
              <strong>Weather Tips:</strong>
              {weatherRecommendations.map((rec, i) => (
                <div key={i}>• {rec}</div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Component Management */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Components ({components.length}):
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '4px 8px',
                border: '1px solid #666',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              All
            </button>
            <button
              onClick={handleClearSelection}
              style={{
                padding: '4px 8px',
                border: '1px solid #666',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Clear
            </button>
          </div>
        </div>
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
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicateSelected()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#4CAF50',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  📋
                </button>
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
                    fontSize: '10px'
                  }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedComponent}
            style={{
              padding: '10px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: selectedComponent ? '#ff4444' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: selectedComponent ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              fontWeight: 'bold',
              opacity: selectedComponent ? 1 : 0.5
            }}
          >
            🗑️ Delete
          </button>
          <button
            onClick={onShowReport}
            style={{
              padding: '10px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            📊 Report
          </button>
          <button
            onClick={onShowMapsIntegration}
            style={{
              padding: '10px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#2196F3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🗺️ Find Building
          </button>
        </div>
      </div>

      {/* Advanced Actions */}
      {showAdvanced && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              onClick={onShowWeatherAnalysis}
              style={{
                padding: '10px',
                border: '1px solid #666',
                borderRadius: '6px',
                background: '#FF9800',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              🌤️ Weather
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              style={{
                padding: '10px',
                border: '1px solid #666',
                borderRadius: '6px',
                background: '#9C27B0',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              💾 Export
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        fontSize: '10px',
        color: '#aaa',
        lineHeight: '1.4',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '10px'
      }}>
        <div>🖱️ <strong>Click:</strong> Select tools & components</div>
        <div>⌨️ <strong>Keys:</strong> Arrow keys to move, R to rotate, +/- to scale</div>
        <div>📐 <strong>View:</strong> Toggle top-down for better design</div>
        <div>📊 <strong>Report:</strong> Generate cost & performance analysis</div>
      </div>
    </div>
  )
}
