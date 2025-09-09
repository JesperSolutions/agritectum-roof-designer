import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Group, GridHelper, LineBasicMaterial, BufferGeometry, LineSegments } from 'three'
import * as THREE from 'three'

interface TopDownViewProps {
  enabled: boolean
  gridSize?: number
  gridDivisions?: number
  showMeasurements?: boolean
  quality?: 'draft' | 'high'
}

export function TopDownView({ 
  enabled, 
  gridSize = 20, 
  gridDivisions = 20, 
  showMeasurements = true,
  quality = 'high'
}: TopDownViewProps) {
  const groupRef = useRef<Group>(null)
  const { camera, scene } = useThree()

  useEffect(() => {
    if (!enabled) return

    // Position camera for top-down view
    camera.position.set(0, 25, 0)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    // Add grid helper
    const gridHelper = new GridHelper(gridSize, gridDivisions, '#888888', '#444444')
    gridHelper.position.y = 8.1 // Slightly above the roof
    gridHelper.rotation.x = -Math.PI / 2
    scene.add(gridHelper)

    // Add measurement lines
    if (showMeasurements && quality === 'high') {
      const measurementGroup = new Group()
      
      // Create measurement lines for building dimensions
      const lineMaterial = new LineBasicMaterial({ color: '#FF6B35', linewidth: 2 })
      
      // Width measurement (X-axis)
      const widthGeometry = new BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, 8.2, 8),
        new THREE.Vector3(10, 8.2, 8)
      ])
      const widthLine = new LineSegments(widthGeometry, lineMaterial)
      measurementGroup.add(widthLine)
      
      // Depth measurement (Z-axis)
      const depthGeometry = new BufferGeometry().setFromPoints([
        new THREE.Vector3(11, 8.2, -7.5),
        new THREE.Vector3(11, 8.2, 7.5)
      ])
      const depthLine = new LineSegments(depthGeometry, lineMaterial)
      measurementGroup.add(depthLine)
      
      // Add measurement text (simplified as 3D text)
      // In a real implementation, you'd use HTML overlays or 3D text
      
      groupRef.current?.add(measurementGroup)
    }

    return () => {
      // Cleanup
      const grid = scene.getObjectByName('grid-helper')
      if (grid) scene.remove(grid)
    }
  }, [enabled, gridSize, gridDivisions, showMeasurements, quality, camera, scene])

  return <group ref={groupRef} />
}

// Grid snapping utility
export function snapToGrid(position: [number, number, number], gridSize: number = 1): [number, number, number] {
  return [
    Math.round(position[0] / gridSize) * gridSize,
    position[1], // Keep Y position as is (roof height)
    Math.round(position[2] / gridSize) * gridSize
  ]
}

// Measurement utility
export function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  const dx = pos2[0] - pos1[0]
  const dz = pos2[2] - pos1[2]
  return Math.sqrt(dx * dx + dz * dz)
}
