import * as THREE from 'three'
import { BuildingFootprint } from '../maps/building-data'

export interface BuildingGeometry {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export interface BuildingMesh {
  meshes: BuildingGeometry[]
  boundingBox: THREE.Box3
  center: [number, number, number]
  dimensions: { width: number; depth: number; height: number }
}

/**
 * Generate a 3D building mesh from building footprint data
 */
export function generateBuildingMesh(footprint: BuildingFootprint): BuildingMesh {
  const meshes: BuildingGeometry[] = []
  
  // Convert coordinates to local space (centered at origin)
  const localCoordinates = footprint.coordinates.map(coord => {
    const [lon, lat] = coord
    const [centerLon, centerLat] = footprint.center
    
    // Convert to meters relative to center
    const x = (lon - centerLon) * 111320 * Math.cos(centerLat * Math.PI / 180)
    const z = (lat - centerLat) * 110540
    
    return [x, 0, z] as [number, number, number]
  })

  // Generate building based on shape
  switch (footprint.shape) {
    case 'rectangular':
      meshes.push(...generateRectangularBuilding(localCoordinates, footprint))
      break
    case 'l-shaped':
      meshes.push(...generateLShapedBuilding(localCoordinates, footprint))
      break
    case 'u-shaped':
      meshes.push(...generateUShapedBuilding(localCoordinates, footprint))
      break
    case 'circular':
      meshes.push(...generateCircularBuilding(localCoordinates, footprint))
      break
    case 'irregular':
    default:
      meshes.push(...generateIrregularBuilding(localCoordinates, footprint))
      break
  }

  // Calculate bounding box
  const boundingBox = new THREE.Box3()
  meshes.forEach(mesh => {
    const geometry = mesh.geometry
    geometry.computeBoundingBox()
    if (geometry.boundingBox) {
      boundingBox.union(geometry.boundingBox)
    }
  })

  // Calculate center and dimensions
  const center: [number, number, number] = [
    (boundingBox.max.x + boundingBox.min.x) / 2,
    (boundingBox.max.y + boundingBox.min.y) / 2,
    (boundingBox.max.z + boundingBox.min.z) / 2
  ]

  const dimensions = {
    width: boundingBox.max.x - boundingBox.min.x,
    depth: boundingBox.max.z - boundingBox.min.z,
    height: boundingBox.max.y - boundingBox.min.y
  }

  return {
    meshes,
    boundingBox,
    center,
    dimensions
  }
}

/**
 * Generate a rectangular building
 */
function generateRectangularBuilding(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Create building walls
  const wallGeometry = createWallGeometry(coordinates, footprint.height || 8)
  const wallMaterial = createBuildingMaterial(footprint.material || 'concrete')
  
  meshes.push({
    geometry: wallGeometry,
    material: wallMaterial,
    position: [0, (footprint.height || 8) / 2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  // Create roof
  const roofGeometry = createRoofGeometry(coordinates, footprint.roofType || 'flat')
  const roofMaterial = createRoofMaterial(footprint.roofMaterial || 'membrane')
  
  meshes.push({
    geometry: roofGeometry,
    material: roofMaterial,
    position: [0, footprint.height || 8, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  // Add building details based on type
  if (footprint.buildingType === 'industrial' || footprint.buildingType === 'warehouse') {
    meshes.push(...generateIndustrialDetails(coordinates, footprint))
  } else if (footprint.buildingType === 'commercial' || footprint.buildingType === 'office') {
    meshes.push(...generateCommercialDetails(coordinates, footprint))
  }

  return meshes
}

/**
 * Generate an L-shaped building
 */
function generateLShapedBuilding(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Split coordinates into two rectangular sections
  const midPoint = Math.floor(coordinates.length / 2)
  const section1 = coordinates.slice(0, midPoint)
  const section2 = coordinates.slice(midPoint)
  
  // Generate each section
  const section1Meshes = generateRectangularBuilding(section1, footprint)
  const section2Meshes = generateRectangularBuilding(section2, footprint)
  
  meshes.push(...section1Meshes, ...section2Meshes)
  
  return meshes
}

/**
 * Generate a U-shaped building
 */
function generateUShapedBuilding(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Split coordinates into three sections
  const third = Math.floor(coordinates.length / 3)
  const section1 = coordinates.slice(0, third)
  const section2 = coordinates.slice(third, third * 2)
  const section3 = coordinates.slice(third * 2)
  
  // Generate each section
  const section1Meshes = generateRectangularBuilding(section1, footprint)
  const section2Meshes = generateRectangularBuilding(section2, footprint)
  const section3Meshes = generateRectangularBuilding(section3, footprint)
  
  meshes.push(...section1Meshes, ...section2Meshes, ...section3Meshes)
  
  return meshes
}

/**
 * Generate a circular building
 */
function generateCircularBuilding(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Calculate center and radius
  const center = calculateCenter(coordinates)
  const radius = calculateRadius(coordinates, center)
  
  // Create circular wall
  const wallGeometry = new THREE.CylinderGeometry(radius, radius, footprint.height || 8, 16)
  const wallMaterial = createBuildingMaterial(footprint.material || 'concrete')
  
  meshes.push({
    geometry: wallGeometry,
    material: wallMaterial,
    position: [center[0], (footprint.height || 8) / 2, center[2]],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  // Create circular roof
  const roofGeometry = new THREE.CircleGeometry(radius, 16)
  const roofMaterial = createRoofMaterial(footprint.roofMaterial || 'membrane')
  
  meshes.push({
    geometry: roofGeometry,
    material: roofMaterial,
    position: [center[0], footprint.height || 8, center[2]],
    rotation: [-Math.PI / 2, 0, 0],
    scale: [1, 1, 1]
  })

  return meshes
}

/**
 * Generate an irregular building using extrusion
 */
function generateIrregularBuilding(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Create shape from coordinates
  const shape = new THREE.Shape()
  shape.moveTo(coordinates[0][0], coordinates[0][2])
  
  for (let i = 1; i < coordinates.length; i++) {
    shape.lineTo(coordinates[i][0], coordinates[i][2])
  }
  shape.closePath()

  // Extrude to create building
  const extrudeSettings = {
    depth: footprint.height || 8,
    bevelEnabled: false
  }
  
  const buildingGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  const buildingMaterial = createBuildingMaterial(footprint.material || 'concrete')
  
  meshes.push({
    geometry: buildingGeometry,
    material: buildingMaterial,
    position: [0, (footprint.height || 8) / 2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  // Create roof
  const roofGeometry = new THREE.ShapeGeometry(shape)
  const roofMaterial = createRoofMaterial(footprint.roofMaterial || 'membrane')
  
  meshes.push({
    geometry: roofGeometry,
    material: roofMaterial,
    position: [0, footprint.height || 8, 0],
    rotation: [-Math.PI / 2, 0, 0],
    scale: [1, 1, 1]
  })

  return meshes
}

/**
 * Create wall geometry from coordinates
 */
function createWallGeometry(coordinates: [number, number, number][], height: number): THREE.BufferGeometry {
  const points = coordinates.map(coord => new THREE.Vector2(coord[0], coord[2]))
  const shape = new THREE.Shape(points)
  
  const extrudeSettings = {
    depth: height,
    bevelEnabled: false
  }
  
  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

/**
 * Create roof geometry based on roof type
 */
function createRoofGeometry(coordinates: [number, number, number][], roofType: string): THREE.BufferGeometry {
  const points = coordinates.map(coord => new THREE.Vector2(coord[0], coord[2]))
  const shape = new THREE.Shape(points)
  
  switch (roofType) {
    case 'gable':
      return createGableRoof(shape)
    case 'hip':
      return createHipRoof(shape)
    case 'shed':
      return createShedRoof(shape)
    case 'flat':
    default:
      return new THREE.ShapeGeometry(shape)
  }
}

/**
 * Create gable roof geometry
 */
function createGableRoof(shape: THREE.Shape): THREE.BufferGeometry {
  // Simplified gable roof - just a triangular prism
  const points = shape.getPoints()
  const center = new THREE.Vector2()
  shape.getPoints().forEach(point => center.add(point))
  center.divideScalar(points.length)
  
  const height = 2 // Roof height
  const roofPoints = points.map(point => new THREE.Vector3(point.x, 0, point.y))
  roofPoints.push(new THREE.Vector3(center.x, height, center.y))
  
  return new THREE.BufferGeometry().setFromPoints(roofPoints)
}

/**
 * Create hip roof geometry
 */
function createHipRoof(shape: THREE.Shape): THREE.BufferGeometry {
  // Simplified hip roof
  const points = shape.getPoints()
  const center = new THREE.Vector2()
  shape.getPoints().forEach(point => center.add(point))
  center.divideScalar(points.length)
  
  const height = 1.5
  const roofPoints = points.map(point => new THREE.Vector3(point.x, 0, point.y))
  roofPoints.push(new THREE.Vector3(center.x, height, center.y))
  
  return new THREE.BufferGeometry().setFromPoints(roofPoints)
}

/**
 * Create shed roof geometry
 */
function createShedRoof(shape: THREE.Shape): THREE.BufferGeometry {
  // Simplified shed roof
  const points = shape.getPoints()
  const height = 1
  const roofPoints = points.map((point, index) => 
    new THREE.Vector3(point.x, height * (index / points.length), point.y)
  )
  
  return new THREE.BufferGeometry().setFromPoints(roofPoints)
}

/**
 * Create building material based on material type
 */
function createBuildingMaterial(materialType: string): THREE.Material {
  const materialProps = {
    concrete: { color: '#C0C0C0', roughness: 0.8, metalness: 0.1 },
    steel: { color: '#708090', roughness: 0.3, metalness: 0.8 },
    brick: { color: '#CD853F', roughness: 0.9, metalness: 0.0 },
    wood: { color: '#DEB887', roughness: 0.7, metalness: 0.0 },
    glass: { color: '#87CEEB', roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.7 }
  }
  
  const props = materialProps[materialType as keyof typeof materialProps] || materialProps.concrete
  
  return new THREE.MeshPhysicalMaterial(props)
}

/**
 * Create roof material based on material type
 */
function createRoofMaterial(materialType: string): THREE.Material {
  const materialProps = {
    membrane: { color: '#2F4F4F', roughness: 0.9, metalness: 0.0 },
    metal: { color: '#708090', roughness: 0.3, metalness: 0.8 },
    tile: { color: '#8B4513', roughness: 0.8, metalness: 0.0 },
    shingle: { color: '#696969', roughness: 0.7, metalness: 0.0 },
    concrete: { color: '#A9A9A9', roughness: 0.8, metalness: 0.1 }
  }
  
  const props = materialProps[materialType as keyof typeof materialProps] || materialProps.membrane
  
  return new THREE.MeshPhysicalMaterial(props)
}

/**
 * Generate industrial building details
 */
function generateIndustrialDetails(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Add loading docks
  const dockGeometry = new THREE.BoxGeometry(3, 2, 1)
  const dockMaterial = new THREE.MeshPhysicalMaterial({ color: '#2F4F4F' })
  
  meshes.push({
    geometry: dockGeometry,
    material: dockMaterial,
    position: [0, 1, coordinates[0][2] + 1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  // Add ventilation units
  const ventGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8)
  const ventMaterial = new THREE.MeshPhysicalMaterial({ color: '#708090' })
  
  meshes.push({
    geometry: ventGeometry,
    material: ventMaterial,
    position: [2, (footprint.height || 8) + 0.5, 2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  return meshes
}

/**
 * Generate commercial building details
 */
function generateCommercialDetails(coordinates: [number, number, number][], footprint: BuildingFootprint): BuildingGeometry[] {
  const meshes: BuildingGeometry[] = []
  
  // Add windows
  const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1)
  const windowMaterial = new THREE.MeshPhysicalMaterial({ 
    color: '#87CEEB', 
    transparent: true, 
    opacity: 0.7 
  })
  
  for (let i = 0; i < 4; i++) {
    meshes.push({
      geometry: windowGeometry,
      material: windowMaterial,
      position: [i * 3 - 4.5, (footprint.height || 8) / 2, coordinates[0][2] + 0.1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    })
  }

  return meshes
}

/**
 * Calculate center of coordinates
 */
function calculateCenter(coordinates: [number, number, number][]): [number, number, number] {
  const sum = coordinates.reduce((acc, coord) => [
    acc[0] + coord[0],
    acc[1] + coord[1],
    acc[2] + coord[2]
  ], [0, 0, 0])
  
  return [
    sum[0] / coordinates.length,
    sum[1] / coordinates.length,
    sum[2] / coordinates.length
  ]
}

/**
 * Calculate radius for circular buildings
 */
function calculateRadius(coordinates: [number, number, number][], center: [number, number, number]): number {
  const distances = coordinates.map(coord => 
    Math.sqrt(
      Math.pow(coord[0] - center[0], 2) + 
      Math.pow(coord[2] - center[2], 2)
    )
  )
  
  return distances.reduce((sum, dist) => sum + dist, 0) / distances.length
}
