import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import * as THREE from 'three'

interface BuildingBodyProps {
  quality?: 'draft' | 'high'
}

export function BuildingBody({ quality = 'high' }: BuildingBodyProps) {
  const groupRef = useRef<Group>(null)
  
  // Try to load the building body glTF model
  let gltf: any = null
  try {
    gltf = useGLTF('/assets/building_body.glb')
  } catch (error) {
    console.warn('Could not load building_body.glb, using fallback geometry:', error)
  }

  // Create fallback house body if glTF is not available
  useEffect(() => {
    if (!gltf || !gltf.scene) {
      // Create a simple fallback house body
      const fallbackGroup = new Group()
      
      // Walls
      const wallGeometry = new THREE.BoxGeometry(4, 3, 4)
      const wallMaterial = new THREE.MeshPhysicalMaterial({
        color: '#F5F5DC',
        roughness: 0.8,
        metalness: 0.1,
        envMapIntensity: 0.5
      })
      const walls = new THREE.Mesh(wallGeometry, wallMaterial)
      walls.position.y = 1.5
      walls.castShadow = true
      walls.receiveShadow = true
      fallbackGroup.add(walls)
      
      // Door
      const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1)
      const doorMaterial = new THREE.MeshPhysicalMaterial({
        color: '#8B4513',
        roughness: 0.8,
        metalness: 0.1
      })
      const door = new THREE.Mesh(doorGeometry, doorMaterial)
      door.position.set(0, 1, 2.05)
      door.castShadow = true
      door.receiveShadow = true
      fallbackGroup.add(door)
      
      // Windows
      const windowGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1)
      const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: '#87CEEB',
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
      })
      
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
      window1.position.set(-1.2, 2, 2.05)
      window1.castShadow = true
      window1.receiveShadow = true
      fallbackGroup.add(window1)
      
      const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
      window2.position.set(1.2, 2, 2.05)
      window2.castShadow = true
      window2.receiveShadow = true
      fallbackGroup.add(window2)
      
      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10)
      const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: '#90EE90',
        roughness: 0.9,
        metalness: 0.0
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -0.1
      ground.receiveShadow = true
      fallbackGroup.add(ground)
      
      if (groupRef.current) {
        groupRef.current.add(fallbackGroup)
      }
    } else {
      // Use loaded glTF model
      const model = gltf.scene.clone()
      
      // Apply proper materials and shadows
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Ensure materials are physical materials
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                if (mat.isMeshStandardMaterial) {
                  const physicalMat = new THREE.MeshPhysicalMaterial({
                    color: mat.color,
                    roughness: mat.roughness,
                    metalness: mat.metalness,
                    map: mat.map,
                    normalMap: mat.normalMap,
                    roughnessMap: mat.roughnessMap,
                    aoMap: mat.aoMap,
                    envMapIntensity: 1.0
                  })
                  child.material = physicalMat
                }
              })
            } else if (child.material.isMeshStandardMaterial) {
              const physicalMat = new THREE.MeshPhysicalMaterial({
                color: child.material.color,
                roughness: child.material.roughness,
                metalness: child.material.metalness,
                map: child.material.map,
                normalMap: child.material.normalMap,
                roughnessMap: child.material.roughnessMap,
                aoMap: child.material.aoMap,
                envMapIntensity: 1.0
              })
              child.material = physicalMat
            }
          }
        }
      })
      
      if (groupRef.current) {
        groupRef.current.add(model)
      }
    }
  }, [gltf, quality])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle animation for the house body
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
    }
  })

  return <group ref={groupRef} />
}
