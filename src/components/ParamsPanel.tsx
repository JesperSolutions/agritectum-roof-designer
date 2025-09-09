import { useState, useEffect } from 'react'
import { RoofParams } from '../lib/roof/geometry'
import { generateRandomSeed } from '../lib/rng'

interface ParamsPanelProps {
  params: RoofParams
  onParamsChange: (params: RoofParams) => void
  onRegenerate: () => void
  onNewSeed: () => void
  onExportScreenshot: () => void
  onCameraPresetChange: (preset: 'street' | 'isometric' | 'front' | 'top') => void
  onQualityChange: (quality: 'draft' | 'high') => void
  currentQuality: 'draft' | 'high'
}

export function ParamsPanel({
  params,
  onParamsChange,
  onRegenerate,
  onNewSeed,
  onExportScreenshot,
  onCameraPresetChange,
  onQualityChange,
  currentQuality
}: ParamsPanelProps) {
  const [localParams, setLocalParams] = useState<RoofParams>(params)
  const [cameraPreset, setCameraPreset] = useState<'street' | 'isometric' | 'front' | 'top'>('street')

  // Update local params when props change
  useEffect(() => {
    setLocalParams(params)
  }, [params])

  const handleParamChange = (key: keyof RoofParams, value: any) => {
    const newParams = { ...localParams, [key]: value }
    setLocalParams(newParams)
    onParamsChange(newParams)
  }

  const handleRegenerate = () => {
    onRegenerate()
  }

  const handleNewSeed = () => {
    const newSeed = generateRandomSeed()
    const newParams = { ...localParams, seed: newSeed }
    setLocalParams(newParams)
    onParamsChange(newParams)
    onNewSeed()
  }

  const handleCameraPreset = (preset: 'street' | 'isometric' | 'front' | 'top') => {
    setCameraPreset(preset)
    onCameraPresetChange(preset)
  }

  const roofTypes = [
    { key: 'flat', name: 'Flat', icon: '🏢' },
    { key: 'gable', name: 'Gable', icon: '🏠' },
    { key: 'hip', name: 'Hip', icon: '🏘️' }
  ]

  const roofMaterials = [
    { key: 'tile', name: 'Tile', color: '#8B4513' },
    { key: 'metal', name: 'Metal', color: '#C0C0C0' },
    { key: 'bitumen', name: 'Bitumen', color: '#2C2C2C' },
    { key: 'slate', name: 'Slate', color: '#4A4A4A' },
    { key: 'copper', name: 'Copper', color: '#B87333' },
    { key: 'terracotta', name: 'Terracotta', color: '#CD853F' }
  ]

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.85)',
      padding: '20px',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      minWidth: '320px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        🏗️ Parametric Roof Designer
      </h3>

      {/* Quality Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Quality Mode:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onQualityChange('draft')}
            style={{
              flex: 1,
              padding: '10px',
              border: currentQuality === 'draft' ? '2px solid #4CAF50' : '1px solid #666',
              borderRadius: '6px',
              background: currentQuality === 'draft' ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Draft (60+ FPS)
          </button>
          <button
            onClick={() => onQualityChange('high')}
            style={{
              flex: 1,
              padding: '10px',
              border: currentQuality === 'high' ? '2px solid #2196F3' : '1px solid #666',
              borderRadius: '6px',
              background: currentQuality === 'high' ? '#2196F3' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            High (Photoreal)
          </button>
        </div>
      </div>

      {/* Advanced Features */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Advanced Features:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <button
            style={{
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🏠 Chimneys
          </button>
          <button
            style={{
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🪟 Dormers
          </button>
          <button
            style={{
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🏗️ Gutters
          </button>
          <button
            style={{
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🎮 Interactive
          </button>
        </div>
      </div>

      {/* Seed Control */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Seed: {localParams.seed}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRegenerate}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#FF9800',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🔄 Regenerate
          </button>
          <button
            onClick={handleNewSeed}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #666',
              borderRadius: '6px',
              background: '#9C27B0',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🎲 New Seed
          </button>
        </div>
      </div>

      {/* Roof Type */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Roof Type:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {roofTypes.map(({ key, name, icon }) => (
            <button
              key={key}
              onClick={() => handleParamChange('type', key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: localParams.type === key ? '2px solid #fff' : '1px solid #666',
                borderRadius: '6px',
                background: localParams.type === key ? '#333' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              {icon} {name}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Dimensions (meters):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#ccc' }}>Width: {localParams.width}m</label>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={localParams.width}
              onChange={(e) => handleParamChange('width', parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#ccc' }}>Depth: {localParams.depth}m</label>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={localParams.depth}
              onChange={(e) => handleParamChange('depth', parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* Pitch (only for gable and hip) */}
      {localParams.type !== 'flat' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            Pitch: {localParams.pitch}°
          </label>
          <input
            type="range"
            min="0"
            max="45"
            step="1"
            value={localParams.pitch}
            onChange={(e) => handleParamChange('pitch', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Overhang */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Overhang: {localParams.overhang}m
        </label>
        <input
          type="range"
          min="0"
          max="0.6"
          step="0.05"
          value={localParams.overhang}
          onChange={(e) => handleParamChange('overhang', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Roof Material */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Roof Material:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {roofMaterials.map(({ key, name, color }) => (
            <button
              key={key}
              onClick={() => handleParamChange('type', key)}
              style={{
                padding: '8px 6px',
                border: localParams.type === key ? '2px solid #fff' : '1px solid #666',
                borderRadius: '6px',
                background: color,
                color: color === '#2C2C2C' || color === '#4A4A4A' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Presets */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Camera View:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { key: 'street', name: 'Street', icon: '🏘️' },
            { key: 'isometric', name: 'Isometric', icon: '📐' },
            { key: 'front', name: 'Front', icon: '🏠' },
            { key: 'top', name: 'Top', icon: '🦅' }
          ].map(({ key, name, icon }) => (
            <button
              key={key}
              onClick={() => handleCameraPreset(key as any)}
              style={{
                padding: '10px 8px',
                border: cameraPreset === key ? '2px solid #fff' : '1px solid #666',
                borderRadius: '6px',
                background: cameraPreset === key ? '#333' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              {icon} {name}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExportScreenshot}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #666',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #007acc, #0056b3)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          marginBottom: '15px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0056b3, #004080)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #007acc, #0056b3)'
        }}
      >
        📸 Export Screenshot
      </button>

      {/* Instructions */}
      <div style={{ 
        fontSize: '11px', 
        color: '#ccc',
        lineHeight: '1.4',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '10px'
      }}>
        <div>🖱️ <strong>Mouse:</strong> Drag to rotate, scroll to zoom</div>
        <div>🖱️ <strong>Right-click:</strong> Pan camera</div>
        <div>🎲 <strong>Seed:</strong> Deterministic generation</div>
        <div>🏗️ <strong>Live:</strong> Real-time roof updates</div>
      </div>
    </div>
  )
}
