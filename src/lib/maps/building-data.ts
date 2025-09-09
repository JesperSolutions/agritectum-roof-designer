export interface BuildingFootprint {
  id: string
  coordinates: [number, number][]
  center: [number, number]
  area: number
  height?: number
  roofType?: 'flat' | 'gable' | 'hip' | 'shed' | 'mansard' | 'gambrel'
  address?: string
  tags?: Record<string, string>
  // Enhanced building details
  buildingType?: 'industrial' | 'commercial' | 'residential' | 'warehouse' | 'office'
  floors?: number
  units?: number
  material?: 'concrete' | 'steel' | 'brick' | 'wood' | 'glass'
  yearBuilt?: number
  // Geometric properties
  width: number
  depth: number
  perimeter: number
  shape: 'rectangular' | 'l-shaped' | 'u-shaped' | 'irregular' | 'circular'
  // Roof specific
  roofMaterial?: 'membrane' | 'metal' | 'tile' | 'shingle' | 'concrete'
  roofCondition?: 'excellent' | 'good' | 'fair' | 'poor'
  // Solar potential
  solarPotential?: 'high' | 'medium' | 'low'
  // Units
  units: 'metric' | 'imperial'
}

export interface OverpassResponse {
  elements: Array<{
    type: 'way' | 'relation'
    id: number
    nodes: number[]
    tags: Record<string, string>
    geometry?: Array<{
      lat: number
      lon: number
    }>
  }>
}

/**
 * Search for buildings using OpenStreetMap Overpass API
 * This is a free service that provides building footprint data
 */
export async function searchBuildings(
  query: string,
  bbox?: { south: number; west: number; north: number; east: number }
): Promise<BuildingFootprint[]> {
  try {
    // If no bbox provided, try to geocode the address first
    let searchBbox = bbox
    if (!searchBbox) {
      const geocoded = await geocodeAddress(query)
      if (geocoded) {
        // Create a small bounding box around the geocoded point
        const buffer = 0.001 // ~100m buffer
        searchBbox = {
          south: geocoded.lat - buffer,
          west: geocoded.lon - buffer,
          north: geocoded.lat + buffer,
          east: geocoded.lon + buffer
        }
      }
    }

    if (!searchBbox) {
      throw new Error('Could not determine search area')
    }

    // Overpass API query to find buildings
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way["building"](bbox:${searchBbox.south},${searchBbox.west},${searchBbox.north},${searchBbox.east});
        relation["building"](bbox:${searchBbox.south},${searchBbox.west},${searchBbox.north},${searchBbox.east});
      );
      out geom;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    return parseBuildingData(data)
  } catch (error) {
    console.error('Error searching buildings:', error)
    // Return mock data as fallback
    return getMockBuildingData()
  }
}

/**
 * Geocode an address using Nominatim (OpenStreetMap's geocoding service)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    
    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`)
    }

    const data = await response.json()
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Parse Overpass API response into BuildingFootprint objects
 */
function parseBuildingData(data: OverpassResponse): BuildingFootprint[] {
  const buildings: BuildingFootprint[] = []

  for (const element of data.elements) {
    if (element.type === 'way' && element.geometry && element.geometry.length >= 3) {
      const coordinates: [number, number][] = element.geometry.map(coord => [coord.lon, coord.lat])
      
      // Calculate geometric properties
      const center = calculateCenter(coordinates)
      const area = calculatePolygonArea(coordinates)
      const dimensions = calculateBuildingDimensions(coordinates)
      const perimeter = calculatePerimeter(coordinates)
      const shape = determineBuildingShape(coordinates)
      
      // Extract building details from tags
      const buildingType = determineBuildingType(element.tags)
      const roofType = determineRoofType(element.tags)
      const height = estimateBuildingHeight(element.tags)
      const floors = estimateFloors(element.tags, height)
      const units = estimateUnits(element.tags, area, buildingType)
      const material = determineBuildingMaterial(element.tags)
      const yearBuilt = extractYearBuilt(element.tags)
      const roofMaterial = determineRoofMaterial(element.tags, buildingType)
      const roofCondition = estimateRoofCondition(element.tags, yearBuilt)
      const solarPotential = assessSolarPotential(coordinates, roofType, height)

      buildings.push({
        id: `building-${element.id}`,
        coordinates,
        center,
        area: Math.round(area),
        height,
        roofType,
        address: element.tags['addr:full'] || element.tags['addr:street'],
        tags: element.tags,
        // Enhanced properties
        buildingType,
        floors,
        units,
        material,
        yearBuilt,
        width: dimensions.width,
        depth: dimensions.depth,
        perimeter: Math.round(perimeter),
        shape,
        roofMaterial,
        roofCondition,
        solarPotential,
        units: 'metric' // Default to metric, can be changed by user
      })
    }
  }

  return buildings
}

/**
 * Calculate the center point of a polygon
 */
function calculateCenter(coordinates: [number, number][]): [number, number] {
  let latSum = 0
  let lonSum = 0
  
  for (const [lon, lat] of coordinates) {
    latSum += lat
    lonSum += lon
  }
  
  return [lonSum / coordinates.length, latSum / coordinates.length]
}

/**
 * Calculate polygon area using the shoelace formula
 * Note: This is a simplified calculation and doesn't account for Earth's curvature
 */
function calculatePolygonArea(coordinates: [number, number][]): number {
  let area = 0
  const n = coordinates.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += coordinates[i][0] * coordinates[j][1]
    area -= coordinates[j][0] * coordinates[i][1]
  }
  
  // Convert to square meters (rough approximation)
  // 1 degree ≈ 111,000 meters
  return Math.abs(area) / 2 * 111000 * 111000
}

/**
 * Determine roof type from building tags
 */
function determineRoofType(tags: Record<string, string>): 'flat' | 'gable' | 'hip' {
  const roofShape = tags['roof:shape']
  
  switch (roofShape) {
    case 'flat':
      return 'flat'
    case 'gabled':
    case 'gable':
      return 'gable'
    case 'hipped':
    case 'hip':
      return 'hip'
    default:
      // Default to flat for industrial buildings
      return 'flat'
  }
}

/**
 * Estimate building height from tags
 */
function estimateBuildingHeight(tags: Record<string, string>): number {
  const height = tags['height']
  if (height) {
    const parsed = parseFloat(height)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  
  const levels = tags['building:levels']
  if (levels) {
    const parsed = parseFloat(levels)
    if (!isNaN(parsed)) {
      return parsed * 3 // Assume 3m per level
    }
  }
  
  // Default height for industrial buildings
  return 8
}

/**
 * Mock building data for development and fallback
 */
function getMockBuildingData(): BuildingFootprint[] {
  return [
    {
      id: 'mock-building-1',
      coordinates: [
        [-74.0059, 40.7128],
        [-74.0049, 40.7128],
        [-74.0049, 40.7138],
        [-74.0059, 40.7138]
      ],
      center: [-74.0054, 40.7133],
      area: 1000,
      height: 8,
      roofType: 'flat',
      address: '123 Industrial Ave, New York, NY',
      buildingType: 'industrial',
      floors: 2,
      units: 2,
      material: 'concrete',
      yearBuilt: 2015,
      width: 32,
      depth: 31,
      perimeter: 126,
      shape: 'rectangular',
      roofMaterial: 'membrane',
      roofCondition: 'good',
      solarPotential: 'high',
      units: 'metric'
    },
    {
      id: 'mock-building-2',
      coordinates: [
        [-74.0069, 40.7128],
        [-74.0059, 40.7128],
        [-74.0059, 40.7138],
        [-74.0069, 40.7138]
      ],
      center: [-74.0064, 40.7133],
      area: 1500,
      height: 12,
      roofType: 'flat',
      address: '456 Warehouse St, New York, NY',
      buildingType: 'warehouse',
      floors: 3,
      units: 3,
      material: 'steel',
      yearBuilt: 2018,
      width: 39,
      depth: 38,
      perimeter: 154,
      shape: 'rectangular',
      roofMaterial: 'membrane',
      roofCondition: 'excellent',
      solarPotential: 'high',
      units: 'metric'
    },
    {
      id: 'mock-building-3',
      coordinates: [
        [-74.0079, 40.7128],
        [-74.0069, 40.7128],
        [-74.0069, 40.7138],
        [-74.0079, 40.7138],
        [-74.0079, 40.7133],
        [-74.0074, 40.7133]
      ],
      center: [-74.0074, 40.7133],
      area: 750,
      height: 6,
      roofType: 'gable',
      address: '789 Commercial Blvd, New York, NY',
      buildingType: 'commercial',
      floors: 1,
      units: 1,
      material: 'brick',
      yearBuilt: 2010,
      width: 25,
      depth: 30,
      perimeter: 110,
      shape: 'l-shaped',
      roofMaterial: 'metal',
      roofCondition: 'fair',
      solarPotential: 'medium',
      units: 'metric'
    }
  ]
}

/**
 * Convert building footprint to roof parameters
 */
export function footprintToRoofParams(footprint: BuildingFootprint) {
  const dimensions = calculateBuildingDimensions(footprint.coordinates)
  
  return {
    width: dimensions.width,
    depth: dimensions.depth,
    pitch: footprint.roofType === 'flat' ? 0 : 25,
    overhang: 0.3,
    type: footprint.roofType || 'flat',
    seed: `building-${footprint.id}`
  }
}

function calculateBuildingDimensions(coordinates: [number, number][]) {
  const lats = coordinates.map(coord => coord[1])
  const lngs = coordinates.map(coord => coord[0])
  
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  
  // More accurate conversion using Haversine formula for latitude
  const latCenter = (minLat + maxLat) / 2
  const latMetersPerDegree = 111132.92 - 559.82 * Math.cos(2 * latCenter * Math.PI / 180) + 1.175 * Math.cos(4 * latCenter * Math.PI / 180)
  const lngMetersPerDegree = 111412.84 * Math.cos(latCenter * Math.PI / 180) - 93.5 * Math.cos(3 * latCenter * Math.PI / 180)
  
  const width = (maxLng - minLng) * lngMetersPerDegree
  const depth = (maxLat - minLat) * latMetersPerDegree
  
  return { width: Math.round(width), depth: Math.round(depth) }
}

/**
 * Calculate perimeter of a polygon
 */
function calculatePerimeter(coordinates: [number, number][]): number {
  let perimeter = 0
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i]
    const next = coordinates[(i + 1) % coordinates.length]
    perimeter += calculateDistance(current, next)
  }
  return perimeter
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000 // Earth's radius in meters
  const lat1 = coord1[1] * Math.PI / 180
  const lat2 = coord2[1] * Math.PI / 180
  const deltaLat = (coord2[1] - coord1[1]) * Math.PI / 180
  const deltaLng = (coord2[0] - coord1[0]) * Math.PI / 180

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Determine building shape based on coordinates
 */
function determineBuildingShape(coordinates: [number, number][]): BuildingFootprint['shape'] {
  if (coordinates.length < 3) return 'irregular'
  
  // Check if it's roughly rectangular
  const isRectangular = isRoughlyRectangular(coordinates)
  if (isRectangular) return 'rectangular'
  
  // Check for L-shape
  const isLShaped = isLShaped(coordinates)
  if (isLShaped) return 'l-shaped'
  
  // Check for U-shape
  const isUShaped = isUShaped(coordinates)
  if (isUShaped) return 'u-shaped'
  
  // Check if roughly circular
  const isCircular = isRoughlyCircular(coordinates)
  if (isCircular) return 'circular'
  
  return 'irregular'
}

/**
 * Check if coordinates form a roughly rectangular shape
 */
function isRoughlyRectangular(coordinates: [number, number][]): boolean {
  if (coordinates.length !== 4) return false
  
  // Calculate angles between consecutive edges
  const angles = []
  for (let i = 0; i < coordinates.length; i++) {
    const prev = coordinates[(i - 1 + coordinates.length) % coordinates.length]
    const curr = coordinates[i]
    const next = coordinates[(i + 1) % coordinates.length]
    
    const angle = calculateAngle(prev, curr, next)
    angles.push(angle)
  }
  
  // Check if angles are close to 90 degrees
  const tolerance = 15 // degrees
  return angles.every(angle => Math.abs(angle - 90) < tolerance)
}

/**
 * Check if coordinates form an L-shape
 */
function isLShaped(coordinates: [number, number][]): boolean {
  // Simplified L-shape detection
  if (coordinates.length < 6) return false
  
  // Look for two main rectangular sections
  const midPoint = Math.floor(coordinates.length / 2)
  const firstHalf = coordinates.slice(0, midPoint)
  const secondHalf = coordinates.slice(midPoint)
  
  return isRoughlyRectangular(firstHalf) && isRoughlyRectangular(secondHalf)
}

/**
 * Check if coordinates form a U-shape
 */
function isUShaped(coordinates: [number, number][]): boolean {
  // Simplified U-shape detection
  if (coordinates.length < 8) return false
  
  // Look for three main sections
  const third = Math.floor(coordinates.length / 3)
  const firstThird = coordinates.slice(0, third)
  const middleThird = coordinates.slice(third, third * 2)
  const lastThird = coordinates.slice(third * 2)
  
  return isRoughlyRectangular(firstThird) && 
         isRoughlyRectangular(middleThird) && 
         isRoughlyRectangular(lastThird)
}

/**
 * Check if coordinates form a roughly circular shape
 */
function isRoughlyCircular(coordinates: [number, number][]): boolean {
  if (coordinates.length < 6) return false
  
  const center = calculateCenter(coordinates)
  const distances = coordinates.map(coord => calculateDistance(center, coord))
  const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length
  const variance = distances.reduce((sum, dist) => sum + Math.pow(dist - avgDistance, 2), 0) / distances.length
  
  // Low variance indicates roughly circular
  return variance < Math.pow(avgDistance * 0.2, 2)
}

/**
 * Calculate angle between three points
 */
function calculateAngle(p1: [number, number], p2: [number, number], p3: [number, number]): number {
  const a = calculateDistance(p1, p2)
  const b = calculateDistance(p2, p3)
  const c = calculateDistance(p1, p3)
  
  // Law of cosines
  const cosAngle = (a * a + b * b - c * c) / (2 * a * b)
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
}

/**
 * Determine building type from tags
 */
function determineBuildingType(tags: Record<string, string>): BuildingFootprint['buildingType'] {
  const building = tags.building?.toLowerCase()
  const amenity = tags.amenity?.toLowerCase()
  const shop = tags.shop?.toLowerCase()
  const office = tags.office?.toLowerCase()
  const industrial = tags.industrial?.toLowerCase()
  
  if (building === 'warehouse' || industrial === 'warehouse') return 'warehouse'
  if (building === 'industrial' || industrial) return 'industrial'
  if (office || building === 'office') return 'office'
  if (shop || building === 'commercial' || amenity === 'marketplace') return 'commercial'
  if (building === 'residential' || building === 'house' || building === 'apartments') return 'residential'
  
  // Default based on size and other indicators
  return 'industrial'
}

/**
 * Estimate number of floors from tags and height
 */
function estimateFloors(tags: Record<string, string>, height: number): number {
  const levels = tags['building:levels']
  if (levels) {
    const parsed = parseInt(levels)
    if (!isNaN(parsed)) return parsed
  }
  
  // Estimate from height (assuming 3m per floor)
  return Math.max(1, Math.round(height / 3))
}

/**
 * Estimate number of units based on area and building type
 */
function estimateUnits(tags: Record<string, string>, area: number, buildingType: BuildingFootprint['buildingType']): number {
  const units = tags['addr:units']
  if (units) {
    const parsed = parseInt(units)
    if (!isNaN(parsed)) return parsed
  }
  
  // Estimate based on building type and area
  switch (buildingType) {
    case 'residential':
      return Math.max(1, Math.round(area / 100)) // ~100m² per unit
    case 'office':
      return Math.max(1, Math.round(area / 200)) // ~200m² per unit
    case 'warehouse':
    case 'industrial':
      return Math.max(1, Math.round(area / 500)) // ~500m² per unit
    default:
      return Math.max(1, Math.round(area / 300)) // ~300m² per unit
  }
}

/**
 * Determine building material from tags
 */
function determineBuildingMaterial(tags: Record<string, string>): BuildingFootprint['material'] {
  const material = tags['building:material']?.toLowerCase()
  const construction = tags['construction']?.toLowerCase()
  
  if (material === 'concrete' || construction === 'concrete') return 'concrete'
  if (material === 'steel' || construction === 'steel') return 'steel'
  if (material === 'brick' || construction === 'brick') return 'brick'
  if (material === 'wood' || construction === 'wood') return 'wood'
  if (material === 'glass' || construction === 'glass') return 'glass'
  
  // Default based on building type
  return 'concrete'
}

/**
 * Extract year built from tags
 */
function extractYearBuilt(tags: Record<string, string>): number | undefined {
  const startDate = tags['start_date']
  if (startDate) {
    const year = parseInt(startDate)
    if (!isNaN(year) && year > 1800 && year <= new Date().getFullYear()) {
      return year
    }
  }
  
  const year = tags['year']
  if (year) {
    const parsed = parseInt(year)
    if (!isNaN(parsed) && parsed > 1800 && parsed <= new Date().getFullYear()) {
      return parsed
    }
  }
  
  return undefined
}

/**
 * Determine roof material from tags and building type
 */
function determineRoofMaterial(tags: Record<string, string>, buildingType: BuildingFootprint['buildingType']): BuildingFootprint['roofMaterial'] {
  const roofMaterial = tags['roof:material']?.toLowerCase()
  
  if (roofMaterial === 'membrane' || roofMaterial === 'epdm') return 'membrane'
  if (roofMaterial === 'metal' || roofMaterial === 'steel') return 'metal'
  if (roofMaterial === 'tile' || roofMaterial === 'ceramic') return 'tile'
  if (roofMaterial === 'shingle' || roofMaterial === 'asphalt') return 'shingle'
  if (roofMaterial === 'concrete') return 'concrete'
  
  // Default based on building type
  switch (buildingType) {
    case 'industrial':
    case 'warehouse':
      return 'membrane'
    case 'commercial':
    case 'office':
      return 'metal'
    default:
      return 'membrane'
  }
}

/**
 * Estimate roof condition based on age and material
 */
function estimateRoofCondition(tags: Record<string, string>, yearBuilt?: number): BuildingFootprint['roofCondition'] {
  const condition = tags['roof:condition']?.toLowerCase()
  if (condition) {
    if (condition === 'excellent' || condition === 'new') return 'excellent'
    if (condition === 'good') return 'good'
    if (condition === 'fair' || condition === 'average') return 'fair'
    if (condition === 'poor' || condition === 'bad') return 'poor'
  }
  
  // Estimate based on age
  if (yearBuilt) {
    const age = new Date().getFullYear() - yearBuilt
    if (age < 5) return 'excellent'
    if (age < 15) return 'good'
    if (age < 30) return 'fair'
    return 'poor'
  }
  
  return 'fair'
}

/**
 * Assess solar potential based on building characteristics
 */
function assessSolarPotential(coordinates: [number, number][], roofType: BuildingFootprint['roofType'], height: number): BuildingFootprint['solarPotential'] {
  // Flat roofs are better for solar
  if (roofType === 'flat') return 'high'
  
  // Check for shading from nearby buildings (simplified)
  const area = calculatePolygonArea(coordinates)
  const perimeter = calculatePerimeter(coordinates)
  const compactness = (4 * Math.PI * area) / (perimeter * perimeter)
  
  // More compact buildings (closer to square) are better for solar
  if (compactness > 0.7) return 'high'
  if (compactness > 0.5) return 'medium'
  return 'low'
}
