import * as THREE from 'three'
import { RoofParams, generateRoofGeometry } from './geometry'
import { SeededRNG } from '../rng'

export interface AdvancedRoofParams extends RoofParams {
  // Additional parameters inspired by the CSG example
  chimneys?: boolean
  dormers?: boolean
  gutters?: boolean
  ridgeVent?: boolean
  complexity?: 'simple' | 'detailed' | 'complex'
}

// Generate chimneys for the roof
export function generateChimneys(params: AdvancedRoofParams, rng: SeededRNG): THREE.Group {
  const group = new THREE.Group()
  
  if (!params.chimneys) return group
  
  const chimneyCount = params.complexity === 'complex' ? rng.int(1, 3) : 1
  
  for (let i = 0; i < chimneyCount; i++) {
    const chimney = new THREE.Group()
    
    // Chimney base
    const baseGeometry = new THREE.BoxGeometry(0.8, 2, 0.8)
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: '#8B4513',
      roughness: 0.8,
      metalness: 0.1
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 1
    chimney.add(base)
    
    // Chimney top (slightly wider)
    const topGeometry = new THREE.BoxGeometry(1, 0.5, 1)
    const top = new THREE.Mesh(topGeometry, baseMaterial)
    top.position.y = 2.25
    chimney.add(top)
    
    // Position chimney on roof
    const x = rng.range(-params.width/2 + 1, params.width/2 - 1)
    const z = rng.range(-params.depth/2 + 1, params.depth/2 - 1)
    chimney.position.set(x, 0, z)
    
    group.add(chimney)
  }
  
  return group
}

// Generate dormers for gable roofs
export function generateDormers(params: AdvancedRoofParams, rng: SeededRNG): THREE.Group {
  const group = new THREE.Group()
  
  if (!params.dormers || params.type === 'flat') return group
  
  const dormerCount = params.complexity === 'complex' ? rng.int(1, 2) : 1
  
  for (let i = 0; i < dormerCount; i++) {
    const dormer = new THREE.Group()
    
    // Dormer window
    const windowGeometry = new THREE.BoxGeometry(1.5, 1, 0.1)
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: '#87CEEB',
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.0
    })
    const window = new THREE.Mesh(windowGeometry, windowMaterial)
    window.position.z = 0.05
    dormer.add(window)
    
    // Dormer roof
    const roofGeometry = new THREE.ConeGeometry(1, 0.8, 4)
    const roofMaterial = new THREE.MeshPhysicalMaterial({
      color: '#8B4513',
      roughness: 0.7,
      metalness: 0.2
    })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = 0.4
    roof.rotation.y = Math.PI / 4
    dormer.add(roof)
    
    // Position dormer on roof slope
    const x = rng.range(-params.width/2 + 1, params.width/2 - 1)
    const z = rng.range(-params.depth/2 + 1, params.depth/2 - 1)
    dormer.position.set(x, 0, z)
    
    group.add(dormer)
  }
  
  return group
}

// Generate gutters around the roof
export function generateGutters(params: AdvancedRoofParams, _rng: SeededRNG): THREE.Group {
  const group = new THREE.Group()
  
  if (!params.gutters) return group
  
  const gutterGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8)
  const gutterMaterial = new THREE.MeshPhysicalMaterial({
    color: '#C0C0C0',
    roughness: 0.3,
    metalness: 0.8
  })
  
  // Front and back gutters
  const frontGutter = new THREE.Mesh(gutterGeometry, gutterMaterial)
  frontGutter.rotation.z = Math.PI / 2
  frontGutter.position.set(0, -0.1, params.depth/2 + params.overhang)
  frontGutter.scale.set(params.width + params.overhang * 2, 1, 1)
  group.add(frontGutter)
  
  const backGutter = new THREE.Mesh(gutterGeometry, gutterMaterial)
  backGutter.rotation.z = Math.PI / 2
  backGutter.position.set(0, -0.1, -params.depth/2 - params.overhang)
  backGutter.scale.set(params.width + params.overhang * 2, 1, 1)
  group.add(backGutter)
  
  // Left and right gutters
  const leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial)
  leftGutter.rotation.x = Math.PI / 2
  leftGutter.position.set(-params.width/2 - params.overhang, -0.1, 0)
  leftGutter.scale.set(params.depth + params.overhang * 2, 1, 1)
  group.add(leftGutter)
  
  const rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial)
  rightGutter.rotation.x = Math.PI / 2
  rightGutter.position.set(params.width/2 + params.overhang, -0.1, 0)
  rightGutter.scale.set(params.depth + params.overhang * 2, 1, 1)
  group.add(rightGutter)
  
  return group
}

// Enhanced roof generation with additional features
export function generateAdvancedRoofGeometry(params: AdvancedRoofParams): {
  roof: THREE.Group
  chimneys: THREE.Group
  dormers: THREE.Group
  gutters: THREE.Group
} {
  const rng = new SeededRNG(params.seed)
  
  // Generate base roof geometry
  const baseRoofData = generateRoofGeometry(params)
  const roofGroup = new THREE.Group()
  
  // Create roof mesh
  const roofMesh = new THREE.Mesh(baseRoofData.geometry, new THREE.MeshPhysicalMaterial({
    color: '#8B4513',
    roughness: 0.7,
    metalness: 0.2
  }))
  roofMesh.castShadow = true
  roofMesh.receiveShadow = true
  roofGroup.add(roofMesh)
  
  // Generate additional features
  const chimneys = generateChimneys(params, rng)
  const dormers = generateDormers(params, rng)
  const gutters = generateGutters(params, rng)
  
  return {
    roof: roofGroup,
    chimneys,
    dormers,
    gutters
  }
}
