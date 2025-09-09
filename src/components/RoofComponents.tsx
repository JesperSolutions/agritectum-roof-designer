import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

export interface RoofComponent {
  id: string
  type: 'hvac' | 'skylight' | 'solar' | 'vent' | 'antenna' | 'water_tank'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  selected?: boolean
}

interface RoofComponentsProps {
  components: RoofComponent[]
  onComponentSelect?: (id: string) => void
  onComponentMove?: (id: string, position: [number, number, number]) => void
  quality?: 'draft' | 'high'
}

// HVAC Unit Component
function HVACUnit({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle animation for selected components
      if (selected) {
        groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
      }
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Main unit */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshPhysicalMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Fan housing */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 8]} />
        <meshPhysicalMaterial color="#E0E0E0" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Pipes */}
      <mesh position={[0.8, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshPhysicalMaterial color="#808080" roughness={0.4} metalness={0.6} />
      </mesh>
      
      <mesh position={[-0.8, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshPhysicalMaterial color="#808080" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Skylight Component
function Skylight({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshPhysicalMaterial color="#606060" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Glass */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.1, 1.8]} />
        <meshPhysicalMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.7} 
          roughness={0.1} 
          metalness={0.0}
          clearcoat={0.8}
        />
      </mesh>
    </group>
  )
}

// Solar Panel Component
function SolarPanel({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Mounting frame */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshPhysicalMaterial color="#404040" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Vent Component
function Vent({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
        <meshPhysicalMaterial color="#808080" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Vent cap */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 0.4, 8]} />
        <meshPhysicalMaterial color="#A0A0A0" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// Antenna Component
function Antenna({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 8]} />
        <meshPhysicalMaterial color="#606060" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Mast */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshPhysicalMaterial color="#C0C0C0" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Antenna array */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshPhysicalMaterial color="#E0E0E0" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Water Tank Component
function WaterTank({ position, rotation, scale, selected }: Omit<RoofComponent, 'id' | 'type'>) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Tank */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 2, 16]} />
        <meshPhysicalMaterial color="#E0E0E0" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Lid */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.2, 16]} />
        <meshPhysicalMaterial color="#C0C0C0" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Support legs */}
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[x, -0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
          <meshPhysicalMaterial color="#808080" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Main RoofComponents component
export function RoofComponents({ components, onComponentSelect: _onComponentSelect, onComponentMove: _onComponentMove, quality: _quality = 'high' }: RoofComponentsProps) {
  const groupRef = useRef<Group>(null)

  const renderComponent = (component: RoofComponent) => {
    const commonProps = {
      position: component.position,
      rotation: component.rotation,
      scale: component.scale,
      selected: component.selected
    }

    switch (component.type) {
      case 'hvac':
        return <HVACUnit key={component.id} {...commonProps} />
      case 'skylight':
        return <Skylight key={component.id} {...commonProps} />
      case 'solar':
        return <SolarPanel key={component.id} {...commonProps} />
      case 'vent':
        return <Vent key={component.id} {...commonProps} />
      case 'antenna':
        return <Antenna key={component.id} {...commonProps} />
      case 'water_tank':
        return <WaterTank key={component.id} {...commonProps} />
      default:
        return null
    }
  }

  return (
    <group ref={groupRef}>
      {components.map(renderComponent)}
    </group>
  )
}
