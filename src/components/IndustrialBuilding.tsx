import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import * as THREE from 'three'

interface IndustrialBuildingProps {
  quality?: 'draft' | 'high'
  showGrid?: boolean
}

export function IndustrialBuilding({ quality = 'high', showGrid: _showGrid = true }: IndustrialBuildingProps) {
  const groupRef = useRef<Group>(null)
  
  // Try to load the industrial building glTF model
  let gltf: any = null
  try {
    gltf = useGLTF('/assets/industrial_building.glb')
  } catch (error) {
    console.warn('Could not load industrial_building.glb, using procedural geometry:', error)
  }

  // Create industrial building with flat roof
  useEffect(() => {
    if (!gltf || !gltf.scene) {
      // Create a procedural industrial building
      const buildingGroup = new Group()
      
      // Main building structure
      const buildingGeometry = new THREE.BoxGeometry(20, 8, 15)
      const buildingMaterial = new THREE.MeshPhysicalMaterial({
        color: '#E0E0E0',
        roughness: 0.8,
        metalness: 0.1,
        envMapIntensity: 0.5
      })
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
      building.position.y = 4
      building.castShadow = true
      building.receiveShadow = true
      buildingGroup.add(building)
      
      // Flat roof (visible from above)
      const roofGeometry = new THREE.PlaneGeometry(20, 15)
      const roofMaterial = new THREE.MeshPhysicalMaterial({
        color: '#8B8B8B',
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
      })
      const roof = new THREE.Mesh(roofGeometry, roofMaterial)
      roof.rotation.x = -Math.PI / 2
      roof.position.y = 8.01
      roof.receiveShadow = true
      buildingGroup.add(roof)
      
      // Roof edge walls (parapet)
      const parapetHeight = 0.5
      const parapetMaterial = new THREE.MeshPhysicalMaterial({
        color: '#A0A0A0',
        roughness: 0.8,
        metalness: 0.1
      })
      
      // Front and back parapets
      const frontParapet = new THREE.Mesh(
        new THREE.BoxGeometry(20, parapetHeight, 0.2),
        parapetMaterial
      )
      frontParapet.position.set(0, 8 + parapetHeight/2, 7.6)
      frontParapet.castShadow = true
      frontParapet.receiveShadow = true
      buildingGroup.add(frontParapet)
      
      const backParapet = new THREE.Mesh(
        new THREE.BoxGeometry(20, parapetHeight, 0.2),
        parapetMaterial
      )
      backParapet.position.set(0, 8 + parapetHeight/2, -7.6)
      backParapet.castShadow = true
      backParapet.receiveShadow = true
      buildingGroup.add(backParapet)
      
      // Left and right parapets
      const leftParapet = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, parapetHeight, 15),
        parapetMaterial
      )
      leftParapet.position.set(-10, 8 + parapetHeight/2, 0)
      leftParapet.castShadow = true
      leftParapet.receiveShadow = true
      buildingGroup.add(leftParapet)
      
      const rightParapet = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, parapetHeight, 15),
        parapetMaterial
      )
      rightParapet.position.set(10, 8 + parapetHeight/2, 0)
      rightParapet.castShadow = true
      rightParapet.receiveShadow = true
      buildingGroup.add(rightParapet)
      
      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(50, 50)
      const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: '#90EE90',
        roughness: 0.9,
        metalness: 0.0
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -0.1
      ground.receiveShadow = true
      buildingGroup.add(ground)
      
      if (groupRef.current) {
        groupRef.current.add(buildingGroup)
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
      // Subtle animation for the building
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.01
    }
  })

  return <group ref={groupRef} />
}
