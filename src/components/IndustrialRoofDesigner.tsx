import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { IndustrialBuilding } from './IndustrialBuilding'
import { RoofComponents, RoofComponent } from './RoofComponents'
import { TopDownView } from './TopDownView'
import { EnhancedDesignToolsPanel } from './EnhancedDesignToolsPanel'
import { EnhancedEnvironment } from './EnhancedEnvironment'
import { ReportGenerator } from './ReportGenerator'
import { MapsIntegration } from './MapsIntegration'
import { UndoRedoManager, ActionTypes } from '../lib/history/undo-redo'
import { generateBillOfMaterials, calculatePerformanceMetrics } from '../lib/analytics/cost-estimation'
import { getWeatherData, calculateSolarAnalysis, generateWeatherRecommendations } from '../lib/analytics/weather-solar'
import { BuildingFootprint, footprintToRoofParams } from '../lib/maps/building-data'

export function IndustrialRoofDesigner() {
  const [components, setComponents] = useState<RoofComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>()
  const [topDownView, setTopDownView] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [quality, setQuality] = useState<'draft' | 'high'>('high')
  const [lightingStyle, setLightingStyle] = useState<'realistic' | 'dramatic' | 'soft' | 'studio'>('realistic')
  const [showReport, setShowReport] = useState(false)
  const [showWeatherAnalysis, setShowWeatherAnalysis] = useState(false)
  const [showMapsIntegration, setShowMapsIntegration] = useState(false)
  const [weatherLocation] = useState('New York')
  
  // Initialize history manager
  const historyManager = useRef(new UndoRedoManager())
  
  // Calculate analytics
  const bom = generateBillOfMaterials(components)
  const metrics = calculatePerformanceMetrics(components)
  const weatherData = getWeatherData(weatherLocation)
  const solarAnalysis = weatherData ? calculateSolarAnalysis(
    components.map(c => ({ type: c.type, area: 1, position: c.position })),
    weatherData,
    300 // roof area
  ) : null

  // Add component to the roof
  const handleAddComponent = useCallback((type: RoofComponent['type'], position: [number, number, number]) => {
    const newComponent: RoofComponent = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      selected: false
    }
    
    setComponents(prev => [...prev, newComponent])
    
    // Add to history
    historyManager.current.pushState(
      ActionTypes.ADD_COMPONENT,
      { type, position },
      `Added ${type} at (${position[0]}, ${position[2]})`
    )
  }, [])

  // Select a component
  const handleSelectComponent = useCallback((id: string) => {
    setSelectedComponent(id)
    setComponents(prev => prev.map(comp => ({
      ...comp,
      selected: comp.id === id
    })))
  }, [])

  // Delete a component
  const handleDeleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
    if (selectedComponent === id) {
      setSelectedComponent(undefined)
    }
    
    // Add to history
    historyManager.current.pushState(
      ActionTypes.DELETE_COMPONENT,
      { id },
      `Deleted component ${id}`
    )
  }, [selectedComponent])

  // Move a component
  const handleMoveComponent = useCallback((id: string, position: [number, number, number]) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, position } : comp
    ))
    
    // Add to history
    historyManager.current.pushState(
      ActionTypes.MOVE_COMPONENT,
      { id, position },
      `Moved component ${id}`
    )
  }, [])

  // Rotate a component
  const handleRotateComponent = useCallback((id: string, rotation: [number, number, number]) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, rotation } : comp
    ))
    
    // Add to history
    historyManager.current.pushState(
      ActionTypes.ROTATE_COMPONENT,
      { id, rotation },
      `Rotated component ${id}`
    )
  }, [])

  // Scale a component
  const handleScaleComponent = useCallback((id: string, scale: [number, number, number]) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, scale } : comp
    ))
    
    // Add to history
    historyManager.current.pushState(
      ActionTypes.SCALE_COMPONENT,
      { id, scale },
      `Scaled component ${id}`
    )
  }, [])

  // Toggle top-down view
  const handleToggleTopDownView = useCallback(() => {
    setTopDownView(prev => !prev)
  }, [])

  // Toggle grid
  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev)
  }, [])

  // Export design
  const handleExportDesign = useCallback(() => {
    const designData = {
      components: components.map(comp => ({
        type: comp.type,
        position: comp.position,
        rotation: comp.rotation,
        scale: comp.scale
      })),
      timestamp: new Date().toISOString(),
      quality,
      lightingStyle
    }
    
    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `industrial_roof_design_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [components, quality, lightingStyle])

  // Export screenshot
  const handleExportScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `industrial_roof_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }, [])

  // Handle building selection from maps
  const handleBuildingSelect = useCallback((footprint: BuildingFootprint) => {
    // Convert building footprint to roof parameters
    const roofParams = footprintToRoofParams(footprint)
    
    // Update building dimensions based on real building data
    console.log('Selected building:', footprint)
    console.log('Generated roof params:', roofParams)
    
    // Store the building data for use in the building component
    // This will be passed to IndustrialBuilding component
    setSelectedBuilding(footprint)
    
    // You could also update the building geometry here
    // by passing the footprint data to the IndustrialBuilding component
  }, [])

  // State for selected building from maps
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingFootprint | null>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ 
          position: topDownView ? [0, 25, 0] : [15, 10, 15], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: quality === 'high',
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={quality === 'high' ? [1, 2] : [1, 1]}
        shadows
      >
        <PerspectiveCamera makeDefault position={topDownView ? [0, 25, 0] : [15, 10, 15]} />
        
        <EnhancedEnvironment 
          quality={quality} 
          lightingStyle={lightingStyle}
          enableAccumulativeShadows={quality === 'high'}
        />
        
        <IndustrialBuilding 
          quality={quality} 
          showGrid={showGrid} 
          buildingData={selectedBuilding}
        />
        
        <RoofComponents 
          components={components}
          onComponentSelect={handleSelectComponent}
          onComponentMove={handleMoveComponent}
          quality={quality}
        />
        
        <TopDownView 
          enabled={topDownView}
          showMeasurements={quality === 'high'}
          quality={quality}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          enableDamping={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={topDownView ? Math.PI / 2 : Math.PI}
          minPolarAngle={topDownView ? Math.PI / 2 : 0}
        />
      </Canvas>
      
      <EnhancedDesignToolsPanel
        components={components}
        onAddComponent={handleAddComponent}
        onSelectComponent={handleSelectComponent}
        onDeleteComponent={handleDeleteComponent}
        onMoveComponent={handleMoveComponent}
        onRotateComponent={handleRotateComponent}
        onScaleComponent={handleScaleComponent}
        selectedComponent={selectedComponent}
        onToggleTopDownView={handleToggleTopDownView}
        topDownView={topDownView}
        onToggleGrid={handleToggleGrid}
        showGrid={showGrid}
        onShowReport={() => setShowReport(true)}
        onShowWeatherAnalysis={() => setShowWeatherAnalysis(true)}
        onShowMapsIntegration={() => setShowMapsIntegration(true)}
        historyManager={historyManager.current}
        bom={bom}
        metrics={metrics}
      />
      
      {/* Additional Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '15px',
        borderRadius: '12px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>
            Quality:
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as 'draft' | 'high')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            <option value="draft">Draft (60+ FPS)</option>
            <option value="high">High (Photoreal)</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>
            Lighting:
          </label>
          <select
            value={lightingStyle}
            onChange={(e) => setLightingStyle(e.target.value as any)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            <option value="realistic">Realistic</option>
            <option value="dramatic">Dramatic</option>
            <option value="soft">Soft</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportDesign}
            style={{
              padding: '8px 12px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            💾 Export Design
          </button>
          
          <button
            onClick={handleExportScreenshot}
            style={{
              padding: '8px 12px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#2196F3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            📸 Screenshot
          </button>
        </div>
      </div>
      
      {/* Report Generator Modal */}
      {showReport && (
        <ReportGenerator
          components={components}
          onClose={() => setShowReport(false)}
          quality={quality}
        />
      )}
      
      {/* Weather Analysis Modal */}
      {showWeatherAnalysis && weatherData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '30px',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>🌤️ Weather Analysis - {weatherData.location}</h2>
            <button
              onClick={() => setShowWeatherAnalysis(false)}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px' }}>
              <h4>Temperature</h4>
              <div>Min: {weatherData.temperature.min}°C</div>
              <div>Max: {weatherData.temperature.max}°C</div>
              <div>Avg: {weatherData.temperature.average}°C</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px' }}>
              <h4>Solar Potential</h4>
              <div>Irradiance: {weatherData.solar.annualIrradiance} kWh/m²/year</div>
              <div>Peak Hours: {weatherData.solar.peakSunHours} hours/day</div>
              <div>Optimal Tilt: {weatherData.solar.optimalTilt}°</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px' }}>
              <h4>Wind Conditions</h4>
              <div>Average: {weatherData.wind.average} mph</div>
              <div>Max: {weatherData.wind.max} mph</div>
              <div>Direction: {weatherData.wind.direction}</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px' }}>
              <h4>Precipitation</h4>
              <div>Annual: {weatherData.precipitation.annual} mm</div>
              <div>Wettest Month: {Math.max(...weatherData.precipitation.monthly)} mm</div>
              <div>Driest Month: {Math.min(...weatherData.precipitation.monthly)} mm</div>
            </div>
          </div>
          
          {solarAnalysis && (
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4>Solar Analysis</h4>
              <div>Total Potential: {solarAnalysis.totalPotential.toFixed(0)} kWh/year</div>
              <div>System Efficiency: {(solarAnalysis.efficiency * 100).toFixed(1)}%</div>
              <div>Payback Period: {solarAnalysis.paybackPeriod.toFixed(1)} years</div>
              <div>Annual Savings: ${solarAnalysis.annualSavings.toFixed(0)}</div>
              <div>CO2 Reduction: {solarAnalysis.co2Reduction.toFixed(2)} tons/year</div>
            </div>
          )}
          
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #FFD700' }}>
            <h4 style={{ color: '#FFD700', marginTop: 0 }}>Recommendations</h4>
            {generateWeatherRecommendations(weatherData, components.map(c => ({ type: c.type, area: 1 }))).map((rec, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>• {rec}</div>
            ))}
          </div>
        </div>
      )}

      {/* Maps Integration Modal */}
      {showMapsIntegration && (
        <MapsIntegration
          onBuildingSelect={handleBuildingSelect}
          onClose={() => setShowMapsIntegration(false)}
        />
      )}
    </div>
  )
}
