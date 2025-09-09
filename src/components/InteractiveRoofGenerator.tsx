import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PivotControls } from '@react-three/drei'
import { Group } from 'three'
import * as THREE from 'three'
import { generateRoofGeometry, RoofParams } from '../lib/roof/geometry'
import { generateAdvancedRoofGeometry, AdvancedRoofParams } from '../lib/roof/advanced-geometry'
import { colorways, createMaterial } from '../lib/materials'

interface InteractiveRoofGeneratorProps {
  params: RoofParams
  quality?: 'draft' | 'high'
  interactive?: boolean
  showChimneys?: boolean
  showDormers?: boolean
  showGutters?: boolean
}

export function InteractiveRoofGenerator({ 
  params, 
  quality = 'high', 
  interactive = false,
  showChimneys = false,
  showDormers = false,
  showGutters = false
}: InteractiveRoofGeneratorProps) {
  const groupRef = useRef<Group>(null)
  const roofRef = useRef<Group>(null)
  const chimneysRef = useRef<Group>(null)
  const dormersRef = useRef<Group>(null)
  const guttersRef = useRef<Group>(null)

  // Generate roof geometry based on parameters
  const roofData = useMemo(() => {
    return generateRoofGeometry(params)
  }, [params])

  // Generate advanced features if enabled
  const advancedFeatures = useMemo(() => {
    if (!showChimneys && !showDormers && !showGutters) return null
    
    const advancedParams: AdvancedRoofParams = {
      ...params,
      chimneys: showChimneys,
      dormers: showDormers,
      gutters: showGutters,
      complexity: quality === 'high' ? 'detailed' : 'simple'
    }
    
    return generateAdvancedRoofGeometry(advancedParams)
  }, [params, showChimneys, showDormers, showGutters, quality])

  // Create roof material based on params
  const roofMaterial = useMemo(() => {
    const colorway = colorways[params.type] || colorways.brown
    return createMaterial(colorway)
  }, [params.type])

  // Update geometry when parameters change
  useEffect(() => {
    if (roofRef.current) {
      // Dispose old geometry
      roofRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          child.geometry.dispose()
        }
      })
      
      // Clear existing children
      roofRef.current.clear()
      
      // Create new roof mesh
      const roofMesh = new THREE.Mesh(roofData.geometry, roofMaterial)
      roofMesh.castShadow = true
      roofMesh.receiveShadow = true
      roofRef.current.add(roofMesh)
    }
  }, [roofData, roofMaterial])

  // Update advanced features
  useEffect(() => {
    if (advancedFeatures && groupRef.current) {
      // Update chimneys
      if (chimneysRef.current) {
        chimneysRef.current.clear()
        if (showChimneys) {
          chimneysRef.current.add(advancedFeatures.chimneys)
        }
      }
      
      // Update dormers
      if (dormersRef.current) {
        dormersRef.current.clear()
        if (showDormers) {
          dormersRef.current.add(advancedFeatures.dormers)
        }
      }
      
      // Update gutters
      if (guttersRef.current) {
        guttersRef.current.clear()
        if (showGutters) {
          guttersRef.current.add(advancedFeatures.gutters)
        }
      }
    }
  }, [advancedFeatures, showChimneys, showDormers, showGutters])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle animation for the roof
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
    }
  })

  const roofContent = (
    <group ref={roofRef} />
  )

  return (
    <group ref={groupRef}>
      {interactive ? (
        <PivotControls
          activeAxes={[true, true, true]}
          scale={1}
          anchor={[0, 0, 0]}
          onDrag={() => {
            // Update parameters based on transform
            console.log('Roof transformed')
          }}
        >
          {roofContent}
        </PivotControls>
      ) : (
        roofContent
      )}
      
      {/* Advanced features */}
      <group ref={chimneysRef} />
      <group ref={dormersRef} />
      <group ref={guttersRef} />
    </group>
  )
}
