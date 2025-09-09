import React, { useRef, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { Group, Vector3 } from 'three'
import * as THREE from 'three'
import { RoofComponent } from './RoofComponents'

interface EnhancedInteractionSystemProps {
  components: RoofComponent[]
  onComponentMove: (id: string, position: [number, number, number]) => void
  onComponentRotate: (id: string, rotation: [number, number, number]) => void
  onComponentScale: (id: string, scale: [number, number, number]) => void
  onComponentSelect: (id: string) => void
  selectedComponent?: string
  quality?: 'draft' | 'high'
}

export function EnhancedInteractionSystem({
  components,
  onComponentMove,
  onComponentRotate,
  onComponentScale,
  onComponentSelect,
  selectedComponent,
  quality: _quality = 'high'
}: EnhancedInteractionSystemProps) {
  const { camera, raycaster, mouse, scene } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Vector3 | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)
  const groupRef = useRef<Group>(null)

  // Handle mouse interactions
  const handlePointerDown = useCallback((event: any) => {
    if (event.target === event.currentTarget) {
      // Clicked on empty space - deselect
      onComponentSelect('')
      return
    }

    const componentId = event.object.userData?.componentId
    if (componentId) {
      onComponentSelect(componentId)
      setIsDragging(true)
      setDragStart(new Vector3().copy(event.point))
    }
  }, [onComponentSelect])

  const handlePointerMove = useCallback((event: any) => {
    if (isDragging && selectedComponent && dragStart) {
      const currentPoint = new Vector3().copy(event.point)
      const delta = currentPoint.clone().sub(dragStart)
      
      // Find the selected component
      const component = components.find(c => c.id === selectedComponent)
      if (component) {
        const newPosition: [number, number, number] = [
          component.position[0] + delta.x,
          component.position[1] + delta.y,
          component.position[2] + delta.z
        ]
        onComponentMove(selectedComponent, newPosition)
        setDragStart(currentPoint)
      }
    }

    // Update hover state
    const intersects = raycaster.intersectObjects(scene.children, true)
    if (intersects.length > 0) {
      const intersected = intersects[0].object
      const componentId = intersected.userData?.componentId
      if (componentId && componentId !== hoveredComponent) {
        setHoveredComponent(componentId)
        document.body.style.cursor = 'pointer'
      }
    } else if (hoveredComponent) {
      setHoveredComponent(null)
      document.body.style.cursor = 'default'
    }
  }, [isDragging, selectedComponent, dragStart, components, onComponentMove, raycaster, scene, hoveredComponent])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedComponent) return

    const component = components.find(c => c.id === selectedComponent)
    if (!component) return

    const moveStep = event.shiftKey ? 0.1 : 1.0
    const rotateStep = event.shiftKey ? 5 : 15 // degrees

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        // Delete component (handled by parent)
        break
      case 'ArrowUp':
        event.preventDefault()
        onComponentMove(selectedComponent, [
          component.position[0],
          component.position[1] + moveStep,
          component.position[2]
        ])
        break
      case 'ArrowDown':
        event.preventDefault()
        onComponentMove(selectedComponent, [
          component.position[0],
          component.position[1] - moveStep,
          component.position[2]
        ])
        break
      case 'ArrowLeft':
        event.preventDefault()
        onComponentMove(selectedComponent, [
          component.position[0] - moveStep,
          component.position[1],
          component.position[2]
        ])
        break
      case 'ArrowRight':
        event.preventDefault()
        onComponentMove(selectedComponent, [
          component.position[0] + moveStep,
          component.position[1],
          component.position[2]
        ])
        break
      case 'r':
        event.preventDefault()
        onComponentRotate(selectedComponent, [
          component.rotation[0],
          component.rotation[1] + THREE.MathUtils.degToRad(rotateStep),
          component.rotation[2]
        ])
        break
      case 'R':
        event.preventDefault()
        onComponentRotate(selectedComponent, [
          component.rotation[0],
          component.rotation[1] - THREE.MathUtils.degToRad(rotateStep),
          component.rotation[2]
        ])
        break
      case '=':
      case '+':
        event.preventDefault()
        const scaleUp = component.scale[0] * 1.1
        onComponentScale(selectedComponent, [scaleUp, scaleUp, scaleUp])
        break
      case '-':
        event.preventDefault()
        const scaleDown = component.scale[0] * 0.9
        onComponentScale(selectedComponent, [scaleDown, scaleDown, scaleDown])
        break
    }
  }, [selectedComponent, components, onComponentMove, onComponentRotate, onComponentScale])

  // Set up event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Update raycaster with mouse position
  useFrame(() => {
    raycaster.setFromCamera(mouse, camera)
  })

  return (
    <group ref={groupRef}>
      {/* Interaction plane for empty space clicks */}
      <mesh
        position={[0, 8.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Transform controls for selected component */}
      {selectedComponent && (
        <TransformControls
          object={scene.getObjectByName(selectedComponent)}
          mode="translate"
          onObjectChange={(event: any) => {
            if (event?.target?.object) {
              const position = event.target.object.position
              const rotation = event.target.object.rotation
              const scale = event.target.object.scale
              
              onComponentMove(selectedComponent, [position.x, position.y, position.z])
              onComponentRotate(selectedComponent, [rotation.x, rotation.y, rotation.z])
              onComponentScale(selectedComponent, [scale.x, scale.y, scale.z])
            }
          }}
        />
      )}
    </group>
  )
}

// Copy/paste functionality
export function useCopyPaste(_components: RoofComponent[], onAddComponent: (type: RoofComponent['type'], position: [number, number, number]) => void) {
  const [clipboard, setClipboard] = useState<RoofComponent | null>(null)

  const copyComponent = useCallback((component: RoofComponent) => {
    setClipboard(component)
  }, [])

  const pasteComponent = useCallback((position: [number, number, number]) => {
    if (clipboard) {
      onAddComponent(clipboard.type, position)
    }
  }, [clipboard, onAddComponent])

  const duplicateComponent = useCallback((component: RoofComponent) => {
    const newPosition: [number, number, number] = [
      component.position[0] + 2,
      component.position[1],
      component.position[2] + 2
    ]
    onAddComponent(component.type, newPosition)
  }, [onAddComponent])

  return {
    copyComponent,
    pasteComponent,
    duplicateComponent,
    canPaste: clipboard !== null
  }
}

// Selection tools
export function useMultiSelect(components: RoofComponent[]) {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])

  const selectComponent = useCallback((id: string, addToSelection = false) => {
    if (addToSelection) {
      setSelectedComponents(prev => 
        prev.includes(id) 
          ? prev.filter(compId => compId !== id)
          : [...prev, id]
      )
    } else {
      setSelectedComponents([id])
    }
  }, [])

  const selectAll = useCallback(() => {
    setSelectedComponents(components.map(c => c.id))
  }, [components])

  const clearSelection = useCallback(() => {
    setSelectedComponents([])
  }, [])

  const selectByType = useCallback((type: string) => {
    setSelectedComponents(components.filter(c => c.type === type).map(c => c.id))
  }, [components])

  return {
    selectedComponents,
    selectComponent,
    selectAll,
    clearSelection,
    selectByType
  }
}
