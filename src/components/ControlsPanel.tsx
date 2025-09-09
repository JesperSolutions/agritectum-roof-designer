import { useState } from 'react'
import { colorways } from '../lib/materials'

interface ControlsPanelProps {
  onRoofColorwayChange?: (colorway: string) => void
  onCameraPresetChange?: (preset: 'street' | 'isometric' | 'front' | 'top') => void
  onExportScreenshot?: () => void
  onQualityChange?: (quality: 'draft' | 'high') => void
  currentQuality?: 'draft' | 'high'
}

export function ControlsPanel({ 
  onRoofColorwayChange, 
  onCameraPresetChange, 
  onExportScreenshot,
  onQualityChange,
  currentQuality = 'high'
}: ControlsPanelProps) {
  const [roofColorway, setRoofColorway] = useState('brown')
  const [cameraPreset, setCameraPreset] = useState<'street' | 'isometric' | 'front' | 'top'>('street')

  const handleRoofColorwayChange = (colorway: string) => {
    setRoofColorway(colorway)
    onRoofColorwayChange?.(colorway)
  }

  const handleCameraPreset = (preset: 'street' | 'isometric' | 'front' | 'top') => {
    setCameraPreset(preset)
    onCameraPresetChange?.(preset)
  }

  const handleQualityChange = (quality: 'draft' | 'high') => {
    onQualityChange?.(quality)
  }

  const handleExportScreenshot = () => {
    onExportScreenshot?.()
  }

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
      minWidth: '280px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        🏠 Roof Designer
      </h3>
      
      {/* Quality Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Quality Mode:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleQualityChange('draft')}
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
            onClick={() => handleQualityChange('high')}
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

      {/* Roof Colorway Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Roof Material:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {Object.entries(colorways).map(([key, colorway]) => (
            <button
              key={key}
              onClick={() => handleRoofColorwayChange(key)}
              style={{
                padding: '10px 8px',
                border: roofColorway === key ? '2px solid #fff' : '1px solid #666',
                borderRadius: '6px',
                background: colorway.baseColor,
                color: colorway.baseColor === '#2F2F2F' || colorway.baseColor === '#8B4513' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {colorway.name}
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
        onClick={handleExportScreenshot}
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
        <div>⚡ <strong>Quality:</strong> Adjust for performance vs realism</div>
        <div>🎨 <strong>Materials:</strong> Realistic PBR colorways</div>
      </div>
    </div>
  )
}
