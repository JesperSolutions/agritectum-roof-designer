import * as THREE from 'three'

export interface Colorway {
  name: string
  baseColor: string
  roughness: number
  metalness: number
  clearcoat?: number
  clearcoatRoughness?: number
  normalScale?: number
}

export const colorways: Record<string, Colorway> = {
  brown: {
    name: 'Brown',
    baseColor: '#8B4513',
    roughness: 0.8,
    metalness: 0.1,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  red: {
    name: 'Red',
    baseColor: '#B22222',
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  blue: {
    name: 'Blue',
    baseColor: '#4169E1',
    roughness: 0.6,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  green: {
    name: 'Green',
    baseColor: '#228B22',
    roughness: 0.8,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  gray: {
    name: 'Gray',
    baseColor: '#696969',
    roughness: 0.7,
    metalness: 0.1,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  black: {
    name: 'Black',
    baseColor: '#2F2F2F',
    roughness: 0.6,
    metalness: 0.2,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  metal: {
    name: 'Metal',
    baseColor: '#C0C0C0',
    roughness: 0.3,
    metalness: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  },
  tile: {
    name: 'Tile',
    baseColor: '#8B4513',
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  // Roof-specific materials
  bitumen: {
    name: 'Bitumen',
    baseColor: '#2C2C2C',
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  slate: {
    name: 'Slate',
    baseColor: '#4A4A4A',
    roughness: 0.8,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  },
  copper: {
    name: 'Copper',
    baseColor: '#B87333',
    roughness: 0.4,
    metalness: 0.8,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1
  },
  terracotta: {
    name: 'Terracotta',
    baseColor: '#CD853F',
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1
  }
}

export const createMaterial = (colorway: Colorway, textureMaps?: {
  map?: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  aoMap?: THREE.Texture
  lightMap?: THREE.Texture
}): THREE.MeshPhysicalMaterial => {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorway.baseColor),
    roughness: colorway.roughness,
    metalness: colorway.metalness,
    clearcoat: colorway.clearcoat || 0,
    clearcoatRoughness: colorway.clearcoatRoughness || 0.1,
    envMapIntensity: 1.0,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    reflectivity: 0.5,
    sheen: 0,
    sheenRoughness: 0,
    sheenColor: new THREE.Color(0x000000)
  })

  // Apply texture maps if provided
  if (textureMaps) {
    if (textureMaps.map) {
      material.map = textureMaps.map
      material.map.anisotropy = 4
    }
    if (textureMaps.normalMap) {
      material.normalMap = textureMaps.normalMap
      material.normalScale = new THREE.Vector2(colorway.normalScale || 1, colorway.normalScale || 1)
    }
    if (textureMaps.roughnessMap) {
      material.roughnessMap = textureMaps.roughnessMap
    }
    if (textureMaps.aoMap) {
      material.aoMap = textureMaps.aoMap
      material.aoMapIntensity = 1.0
    }
    if (textureMaps.lightMap) {
      material.lightMap = textureMaps.lightMap
      material.lightMapIntensity = 1.0
    }
  }

  return material
}

export const createWindowMaterial = (): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x87CEEB),
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transmission: 0.1,
    thickness: 0.1,
    ior: 1.5,
    envMapIntensity: 1.0
  })
}

export const createWallMaterial = (): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xF5F5DC),
    roughness: 0.8,
    metalness: 0.1,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.5
  })
}
