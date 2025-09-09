import { useState } from 'react'

interface UIControlsProps {
  onRoofColorChange?: (color: string) => void
  onCameraPresetChange?: (preset: 'street' | 'isometric') => void
  onExportScreenshot?: () => void
}

export function UIControls({ 
  onRoofColorChange, 
  onCameraPresetChange, 
  onExportScreenshot 
}: UIControlsProps) {
  const [roofColor, setRoofColor] = useState('#8B4513')
  const [cameraPreset, setCameraPreset] = useState<'street' | 'isometric'>('street')

  const roofColors = [
    { name: 'Brown', value: '#8B4513' },
    { name: 'Red', value: '#B22222' },
    { name: 'Blue', value: '#4169E1' },
    { name: 'Green', value: '#228B22' },
    { name: 'Gray', value: '#696969' },
    { name: 'Black', value: '#2F2F2F' }
  ]

  const handleRoofColorChange = (color: string) => {
    setRoofColor(color)
    onRoofColorChange?.(color)
  }

  const handleCameraPreset = (preset: 'street' | 'isometric') => {
    setCameraPreset(preset)
    onCameraPresetChange?.(preset)
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
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      minWidth: '250px'
    }}>
      <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Roof Designer</h3>
      
      {/* Roof Color Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          Roof Color:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {roofColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleRoofColorChange(color.value)}
              style={{
                padding: '8px',
                border: roofColor === color.value ? '2px solid #fff' : '1px solid #666',
                borderRadius: '4px',
                background: color.value,
                color: color.value === '#2F2F2F' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Presets */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          Camera View:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleCameraPreset('street')}
            style={{
              padding: '8px 16px',
              border: cameraPreset === 'street' ? '2px solid #fff' : '1px solid #666',
              borderRadius: '4px',
              background: cameraPreset === 'street' ? '#333' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Street View
          </button>
          <button
            onClick={() => handleCameraPreset('isometric')}
            style={{
              padding: '8px 16px',
              border: cameraPreset === 'isometric' ? '2px solid #fff' : '1px solid #666',
              borderRadius: '4px',
              background: cameraPreset === 'isometric' ? '#333' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Isometric
          </button>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExportScreenshot}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #666',
          borderRadius: '4px',
          background: '#007acc',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Export Screenshot
      </button>

      {/* Instructions */}
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#ccc',
        lineHeight: '1.4'
      }}>
        <div>• Drag to rotate view</div>
        <div>• Scroll to zoom</div>
        <div>• Right-click + drag to pan</div>
      </div>
    </div>
  )
}
