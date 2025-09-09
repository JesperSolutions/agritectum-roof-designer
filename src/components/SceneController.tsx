import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { cameraPresets, applyCameraPreset } from '../lib/cameraPresets'
import { RoofParams } from '../lib/roof/geometry'

interface SceneControllerProps {
  onExportScreenshot?: () => void
  quality?: 'draft' | 'high'
  roofParams?: RoofParams
}

export function SceneController({ onExportScreenshot: _onExportScreenshot, quality = 'high', roofParams }: SceneControllerProps) {
  const { camera, gl, scene } = useThree()

  // Create export function with quality-based resolution and parameter filename
  const exportScreenshot = () => {
    const canvas = gl.domElement
    const originalSize = { width: canvas.width, height: canvas.height }
    
    // Set higher resolution for export
    const scale = quality === 'high' ? 2 : 1.5
    canvas.width = originalSize.width * scale
    canvas.height = originalSize.height * scale
    
    // Render at higher resolution
    gl.setSize(canvas.width, canvas.height, false)
    gl.render(scene, camera)
    
    // Create filename with parameters
    let filename = `roof_${quality}`
    if (roofParams) {
      filename += `_w${roofParams.width}_d${roofParams.depth}_${roofParams.type}`
      if (roofParams.type !== 'flat') {
        filename += `_pitch${roofParams.pitch}`
      }
      filename += `_overhang${roofParams.overhang}_seed${roofParams.seed}`
    }
    filename += `_${Date.now()}.png`
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    // Restore original size
    canvas.width = originalSize.width
    canvas.height = originalSize.height
    gl.setSize(originalSize.width, originalSize.height, false)
  }

  // Expose functions globally
  useEffect(() => {
    const handleCameraPreset = (preset: 'street' | 'isometric' | 'front' | 'top') => {
      const presetData = cameraPresets[preset]
      if (presetData) {
        applyCameraPreset(camera, presetData)
      }
    }

    // Store functions globally so they can be accessed from outside the Canvas
    ;(window as any).handleCameraPreset = handleCameraPreset
    ;(window as any).exportScreenshot = exportScreenshot

    return () => {
      delete (window as any).handleCameraPreset
      delete (window as any).exportScreenshot
    }
  }, [camera, gl, quality])

  return null // This component doesn't render anything
}
