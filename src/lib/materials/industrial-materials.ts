import * as THREE from 'three'
import { MeshPhysicalMaterial } from 'three'

// Industrial roof materials with realistic properties
export const industrialMaterials = {
  // Roof membrane materials
  EPDM: {
    name: 'EPDM Rubber',
    color: '#2C2C2C',
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    normalScale: 0.5,
    price: 8.50, // per sq ft
    durability: 30, // years
    description: 'Ethylene Propylene Diene Monomer - durable rubber roofing'
  },
  
  TPO: {
    name: 'TPO Membrane',
    color: '#F5F5F5',
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    normalScale: 0.3,
    price: 6.75,
    durability: 25,
    description: 'Thermoplastic Polyolefin - energy efficient white membrane'
  },
  
  MetalPanel: {
    name: 'Metal Panel',
    color: '#C0C0C0',
    roughness: 0.3,
    metalness: 0.8,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    normalScale: 0.2,
    price: 12.00,
    durability: 40,
    description: 'Galvanized steel panels - long lasting and recyclable'
  },
  
  Bitumen: {
    name: 'Modified Bitumen',
    color: '#1a1a1a',
    roughness: 0.8,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.2,
    normalScale: 0.6,
    price: 5.25,
    durability: 20,
    description: 'Asphalt-based membrane - cost effective option'
  },
  
  // HVAC materials
  HVACUnit: {
    name: 'HVAC Unit',
    color: '#E0E0E0',
    roughness: 0.3,
    metalness: 0.7,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    normalScale: 0.1,
    price: 0, // per unit
    durability: 15,
    description: 'Commercial HVAC unit'
  },
  
  // Solar panel materials
  SolarPanel: {
    name: 'Solar Panel',
    color: '#1a1a1a',
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.05,
    normalScale: 0.1,
    price: 3.50, // per watt
    durability: 25,
    description: 'Monocrystalline silicon solar panel'
  },
  
  // Skylight materials
  SkylightGlass: {
    name: 'Skylight Glass',
    color: '#87CEEB',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.02,
    normalScale: 0.0,
    price: 0, // per sq ft
    durability: 20,
    description: 'Tempered safety glass for skylights'
  },
  
  SkylightFrame: {
    name: 'Skylight Frame',
    color: '#606060',
    roughness: 0.3,
    metalness: 0.8,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    normalScale: 0.2,
    price: 0,
    durability: 25,
    description: 'Aluminum frame for skylights'
  }
}

// Create material with enhanced properties
export function createIndustrialMaterial(materialType: keyof typeof industrialMaterials, options: {
  useTextures?: boolean
  quality?: 'draft' | 'high'
  weathering?: number // 0-1, amount of weathering
} = {}) {
  const material = industrialMaterials[materialType]
  const { useTextures: _useTextures = false, quality = 'high', weathering = 0 } = options
  
  const physicalMaterial = new MeshPhysicalMaterial({
    color: new THREE.Color(material.color),
    roughness: material.roughness + (weathering * 0.2), // More weathering = more rough
    metalness: material.metalness,
    clearcoat: material.clearcoat,
    clearcoatRoughness: material.clearcoatRoughness + (weathering * 0.1),
    normalScale: new THREE.Vector2(material.normalScale, material.normalScale),
    envMapIntensity: quality === 'high' ? 1.0 : 0.5,
    transmission: materialType === 'SkylightGlass' ? 0.9 : 0,
    thickness: materialType === 'SkylightGlass' ? 0.1 : 0,
    ior: materialType === 'SkylightGlass' ? 1.52 : 1.0
  })
  
  // Add weathering effects
  if (weathering > 0) {
    const weatheredColor = new THREE.Color(material.color)
    weatheredColor.multiplyScalar(1 - (weathering * 0.3)) // Darken with weathering
    physicalMaterial.color = weatheredColor
  }
  
  return physicalMaterial
}

// Weather effects
export function addWeatheringEffect(material: MeshPhysicalMaterial, weathering: number) {
  if (weathering > 0) {
    // Add subtle color variation for weathering
    const baseColor = material.color.clone()
    baseColor.multiplyScalar(1 - (weathering * 0.2))
    material.color = baseColor
    
    // Increase roughness
    material.roughness = Math.min(1.0, material.roughness + (weathering * 0.3))
  }
}

// Cost calculation utilities
export function calculateMaterialCost(materialType: keyof typeof industrialMaterials, area: number): number {
  const material = industrialMaterials[materialType]
  return material.price * area
}

export function calculateTotalCost(components: Array<{type: string, area: number}>): number {
  return components.reduce((total, component) => {
    const materialType = component.type as keyof typeof industrialMaterials
    if (industrialMaterials[materialType]) {
      return total + calculateMaterialCost(materialType, component.area)
    }
    return total
  }, 0)
}
