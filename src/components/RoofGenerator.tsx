import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import { generateRoofGeometry, RoofParams } from '../lib/roof/geometry'
import { colorways, createMaterial } from '../lib/materials'

interface RoofGeneratorProps {
  params: RoofParams
  quality?: 'draft' | 'high'
}

export function RoofGenerator({ params, quality: _quality = 'high' }: RoofGeneratorProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)

  // Generate roof geometry based on parameters
  const roofData = useMemo(() => {
    return generateRoofGeometry(params)
  }, [params])

  // Create roof material based on params
  const roofMaterial = useMemo(() => {
    const colorway = colorways[params.type] || colorways.brown
    return createMaterial(colorway)
  }, [params.type])

  // Update geometry when parameters change
  useEffect(() => {
    if (meshRef.current) {
      // Dispose old geometry
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose()
      }
      
      // Set new geometry
      meshRef.current.geometry = roofData.geometry
    }
  }, [roofData])

  // Update material when type changes
  useEffect(() => {
    if (meshRef.current) {
      // Dispose old material
      if (meshRef.current.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat: any) => mat.dispose())
        } else {
          meshRef.current.material.dispose()
        }
      }
      
      // Set new material
      meshRef.current.material = roofMaterial
    }
  }, [roofMaterial])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle animation for the roof
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={roofData.geometry}
        material={roofMaterial}
      />
    </group>
  )
}
