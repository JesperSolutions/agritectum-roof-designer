import * as THREE from 'three'
import { SeededRNG } from '../rng'

export interface RoofParams {
  width: number
  depth: number
  pitch: number // degrees
  overhang: number
  type: 'flat' | 'gable' | 'hip'
  seed: string | number
}

export interface RoofGeometry {
  geometry: THREE.BufferGeometry
  vertices: THREE.Vector3[]
  faces: number[]
  uvs: number[]
  normals: number[]
}

// Generate UV coordinates for a face
function generateFaceUVs(vertices: THREE.Vector3[], faceIndices: number[]): number[] {
  const uvs: number[] = []
  
  for (let i = 0; i < faceIndices.length; i += 3) {
    const v1 = vertices[faceIndices[i]]
    const v2 = vertices[faceIndices[i + 1]]
    const v3 = vertices[faceIndices[i + 2]]
    
    // Calculate face normal for UV projection
    const edge1 = new THREE.Vector3().subVectors(v2, v1)
    const edge2 = new THREE.Vector3().subVectors(v3, v1)
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()
    
    // Determine UV projection based on dominant normal component
    const absX = Math.abs(normal.x)
    const absY = Math.abs(normal.y)
    const absZ = Math.abs(normal.z)
    
    if (absY > absX && absY > absZ) {
      // Top/bottom face - use XZ projection
      uvs.push(v1.x, v1.z, v2.x, v2.z, v3.x, v3.z)
    } else if (absZ > absX) {
      // Front/back face - use XY projection
      uvs.push(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y)
    } else {
      // Left/right face - use YZ projection
      uvs.push(v1.y, v1.z, v2.y, v2.z, v3.y, v3.z)
    }
  }
  
  return uvs
}

// Calculate face normals
function calculateFaceNormals(vertices: THREE.Vector3[], faceIndices: number[]): number[] {
  const normals: number[] = new Array(vertices.length * 3).fill(0)
  const faceCounts: number[] = new Array(vertices.length).fill(0)
  
  for (let i = 0; i < faceIndices.length; i += 3) {
    const i1 = faceIndices[i]
    const i2 = faceIndices[i + 1]
    const i3 = faceIndices[i + 2]
    
    const v1 = vertices[i1]
    const v2 = vertices[i2]
    const v3 = vertices[i3]
    
    const edge1 = new THREE.Vector3().subVectors(v2, v1)
    const edge2 = new THREE.Vector3().subVectors(v3, v1)
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()
    
    // Add normal to each vertex
    normals[i1 * 3] += normal.x
    normals[i1 * 3 + 1] += normal.y
    normals[i1 * 3 + 2] += normal.z
    faceCounts[i1]++
    
    normals[i2 * 3] += normal.x
    normals[i2 * 3 + 1] += normal.y
    normals[i2 * 3 + 2] += normal.z
    faceCounts[i2]++
    
    normals[i3 * 3] += normal.x
    normals[i3 * 3 + 1] += normal.y
    normals[i3 * 3 + 2] += normal.z
    faceCounts[i3]++
  }
  
  // Normalize vertex normals
  for (let i = 0; i < vertices.length; i++) {
    if (faceCounts[i] > 0) {
      const factor = 1 / faceCounts[i]
      normals[i * 3] *= factor
      normals[i * 3 + 1] *= factor
      normals[i * 3 + 2] *= factor
      
      const normal = new THREE.Vector3(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2])
      normal.normalize()
      
      normals[i * 3] = normal.x
      normals[i * 3 + 1] = normal.y
      normals[i * 3 + 2] = normal.z
    }
  }
  
  return normals
}

// Generate flat roof
function generateFlatRoof(params: RoofParams, _rng: SeededRNG): RoofGeometry {
  const { width, depth, overhang } = params
  const vertices: THREE.Vector3[] = []
  const faces: number[] = []
  
  // Base rectangle with overhang
  const halfWidth = width / 2 + overhang
  const halfDepth = depth / 2 + overhang
  
  // Vertices (top face)
  vertices.push(
    new THREE.Vector3(-halfWidth, 0, -halfDepth), // 0
    new THREE.Vector3(halfWidth, 0, -halfDepth),  // 1
    new THREE.Vector3(halfWidth, 0, halfDepth),   // 2
    new THREE.Vector3(-halfWidth, 0, halfDepth)   // 3
  )
  
  // Face (two triangles)
  faces.push(0, 1, 2, 0, 2, 3)
  
  const uvs = generateFaceUVs(vertices, faces)
  const normals = calculateFaceNormals(vertices, faces)
  
  return { geometry: new THREE.BufferGeometry(), vertices, faces, uvs, normals }
}

// Generate gable roof
function generateGableRoof(params: RoofParams, _rng: SeededRNG): RoofGeometry {
  const { width, depth, pitch, overhang } = params
  const vertices: THREE.Vector3[] = []
  const faces: number[] = []
  
  const halfWidth = width / 2 + overhang
  const halfDepth = depth / 2 + overhang
  const pitchRad = (pitch * Math.PI) / 180
  const ridgeHeight = (width / 2) * Math.tan(pitchRad)
  
  // Vertices
  // Bottom face
  vertices.push(
    new THREE.Vector3(-halfWidth, 0, -halfDepth), // 0
    new THREE.Vector3(halfWidth, 0, -halfDepth),  // 1
    new THREE.Vector3(halfWidth, 0, halfDepth),   // 2
    new THREE.Vector3(-halfWidth, 0, halfDepth)   // 3
  )
  
  // Ridge points
  vertices.push(
    new THREE.Vector3(0, ridgeHeight, -halfDepth), // 4
    new THREE.Vector3(0, ridgeHeight, halfDepth)   // 5
  )
  
  // Roof faces
  // Front gable
  faces.push(0, 4, 1)
  // Back gable
  faces.push(2, 5, 3)
  // Left side
  faces.push(0, 3, 4, 3, 5, 4)
  // Right side
  faces.push(1, 4, 2, 4, 5, 2)
  // Bottom face
  faces.push(0, 1, 2, 0, 2, 3)
  
  const uvs = generateFaceUVs(vertices, faces)
  const normals = calculateFaceNormals(vertices, faces)
  
  return { geometry: new THREE.BufferGeometry(), vertices, faces, uvs, normals }
}

// Generate hip roof
function generateHipRoof(params: RoofParams, _rng: SeededRNG): RoofGeometry {
  const { width, depth, pitch, overhang } = params
  const vertices: THREE.Vector3[] = []
  const faces: number[] = []
  
  const halfWidth = width / 2 + overhang
  const halfDepth = depth / 2 + overhang
  const pitchRad = (pitch * Math.PI) / 180
  const ridgeHeight = (Math.min(width, depth) / 2) * Math.tan(pitchRad)
  
  // Vertices
  // Base rectangle
  vertices.push(
    new THREE.Vector3(-halfWidth, 0, -halfDepth), // 0
    new THREE.Vector3(halfWidth, 0, -halfDepth),  // 1
    new THREE.Vector3(halfWidth, 0, halfDepth),   // 2
    new THREE.Vector3(-halfWidth, 0, halfDepth)   // 3
  )
  
  // Ridge points (centered)
  vertices.push(
    new THREE.Vector3(0, ridgeHeight, -halfDepth), // 4
    new THREE.Vector3(0, ridgeHeight, halfDepth)   // 5
  )
  
  // Hip roof faces
  // Front hip
  faces.push(0, 4, 1)
  // Back hip
  faces.push(2, 5, 3)
  // Left side (two triangles)
  faces.push(0, 3, 4, 3, 5, 4)
  // Right side (two triangles)
  faces.push(1, 4, 2, 4, 5, 2)
  // Bottom face
  faces.push(0, 1, 2, 0, 2, 3)
  
  const uvs = generateFaceUVs(vertices, faces)
  const normals = calculateFaceNormals(vertices, faces)
  
  return { geometry: new THREE.BufferGeometry(), vertices, faces, uvs, normals }
}

// Main roof generation function
export function generateRoofGeometry(params: RoofParams): RoofGeometry {
  const rng = new SeededRNG(params.seed)
  
  let roofData: RoofGeometry
  
  switch (params.type) {
    case 'flat':
      roofData = generateFlatRoof(params, rng)
      break
    case 'gable':
      roofData = generateGableRoof(params, rng)
      break
    case 'hip':
      roofData = generateHipRoof(params, rng)
      break
    default:
      roofData = generateGableRoof(params, rng)
  }
  
  // Create Three.js geometry
  const geometry = new THREE.BufferGeometry()
  
  // Set vertices
  const positions = new Float32Array(roofData.vertices.length * 3)
  for (let i = 0; i < roofData.vertices.length; i++) {
    positions[i * 3] = roofData.vertices[i].x
    positions[i * 3 + 1] = roofData.vertices[i].y
    positions[i * 3 + 2] = roofData.vertices[i].z
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  // Set normals
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(roofData.normals), 3))
  
  // Set UVs
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(roofData.uvs), 2))
  
  // Set faces
  geometry.setIndex(roofData.faces)
  
  // Compute bounding sphere
  geometry.computeBoundingSphere()
  
  roofData.geometry = geometry
  return roofData
}

// Utility function to get roof bounds
export function getRoofBounds(params: RoofParams): { width: number; depth: number; height: number } {
  const { width, depth, pitch, overhang } = params
  const actualWidth = width + overhang * 2
  const actualDepth = depth + overhang * 2
  
  let height = 0
  if (params.type !== 'flat') {
    const pitchRad = (pitch * Math.PI) / 180
    if (params.type === 'gable') {
      height = (width / 2) * Math.tan(pitchRad)
    } else if (params.type === 'hip') {
      height = (Math.min(width, depth) / 2) * Math.tan(pitchRad)
    }
  }
  
  return { width: actualWidth, depth: actualDepth, height }
}
