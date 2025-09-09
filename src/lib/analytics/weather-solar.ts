// Weather and solar analysis for roof design
export interface WeatherData {
  location: string
  latitude: number
  longitude: number
  temperature: {
    min: number
    max: number
    average: number
  }
  precipitation: {
    annual: number
    monthly: number[]
  }
  wind: {
    average: number
    max: number
    direction: string
  }
  solar: {
    annualIrradiance: number // kWh/m²/year
    peakSunHours: number
    optimalTilt: number
    optimalAzimuth: number
  }
}

export interface SolarAnalysis {
  totalPotential: number // kWh/year
  efficiency: number // 0-1
  paybackPeriod: number // years
  annualSavings: number // USD
  co2Reduction: number // tons/year
  shadingFactor: number // 0-1
}

// Sample weather data for major cities
export const weatherDatabase: Record<string, WeatherData> = {
  'New York': {
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    temperature: { min: -2, max: 28, average: 13 },
    precipitation: { annual: 1200, monthly: [80, 70, 90, 100, 110, 100, 110, 100, 90, 80, 90, 80] },
    wind: { average: 12, max: 35, direction: 'NW' },
    solar: { annualIrradiance: 1400, peakSunHours: 4.2, optimalTilt: 35, optimalAzimuth: 180 }
  },
  'Los Angeles': {
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    temperature: { min: 8, max: 32, average: 20 },
    precipitation: { annual: 400, monthly: [60, 50, 40, 20, 10, 5, 5, 5, 10, 20, 30, 50] },
    wind: { average: 8, max: 25, direction: 'W' },
    solar: { annualIrradiance: 1800, peakSunHours: 5.5, optimalTilt: 30, optimalAzimuth: 180 }
  },
  'Chicago': {
    location: 'Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    temperature: { min: -8, max: 30, average: 11 },
    precipitation: { annual: 900, monthly: [50, 50, 70, 80, 90, 100, 90, 80, 70, 60, 70, 60] },
    wind: { average: 15, max: 40, direction: 'W' },
    solar: { annualIrradiance: 1300, peakSunHours: 4.0, optimalTilt: 40, optimalAzimuth: 180 }
  },
  'Miami': {
    location: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    temperature: { min: 15, max: 35, average: 25 },
    precipitation: { annual: 1500, monthly: [50, 60, 80, 100, 150, 200, 150, 180, 200, 150, 80, 60] },
    wind: { average: 10, max: 30, direction: 'E' },
    solar: { annualIrradiance: 1600, peakSunHours: 4.8, optimalTilt: 25, optimalAzimuth: 180 }
  },
  'Seattle': {
    location: 'Seattle, WA',
    latitude: 47.6062,
    longitude: -122.3321,
    temperature: { min: 2, max: 25, average: 12 },
    precipitation: { annual: 950, monthly: [120, 90, 80, 60, 50, 40, 30, 30, 50, 80, 120, 120] },
    wind: { average: 8, max: 25, direction: 'SW' },
    solar: { annualIrradiance: 1100, peakSunHours: 3.5, optimalTilt: 45, optimalAzimuth: 180 }
  }
}

// Calculate solar analysis for a roof design
export function calculateSolarAnalysis(
  components: Array<{type: string, area: number, position: [number, number, number]}>,
  weatherData: WeatherData,
  roofArea: number
): SolarAnalysis {
  const solarPanels = components.filter(c => c.type === 'solar')
  const totalSolarArea = solarPanels.reduce((sum, panel) => sum + panel.area, 0)
  
  // Calculate shading factor based on other components
  const shadingComponents = components.filter(c => c.type !== 'solar')
  const shadingFactor = calculateShadingFactor(solarPanels, shadingComponents, roofArea)
  
  // Calculate solar potential
  const systemEfficiency = 0.20 // 20% efficiency for solar panels
  const totalPotential = totalSolarArea * weatherData.solar.annualIrradiance * systemEfficiency * (1 - shadingFactor)
  
  // Calculate financial metrics
  const electricityCost = 0.12 // $0.12 per kWh
  const annualSavings = totalPotential * electricityCost
  const systemCost = totalSolarArea * 4.00 // $4 per watt installed
  const paybackPeriod = systemCost / annualSavings
  
  // Calculate CO2 reduction (0.4 kg CO2 per kWh)
  const co2Reduction = totalPotential * 0.4 / 1000 // Convert to tons
  
  return {
    totalPotential,
    efficiency: systemEfficiency * (1 - shadingFactor),
    paybackPeriod,
    annualSavings,
    co2Reduction,
    shadingFactor
  }
}

// Calculate shading factor based on component positions
function calculateShadingFactor(
  solarPanels: Array<{area: number, position: [number, number, number]}>,
  shadingComponents: Array<{area: number, position: [number, number, number]}>,
  roofArea: number
): number {
  if (shadingComponents.length === 0) return 0
  
  // Simple shading calculation based on proximity
  let totalShading = 0
  
  solarPanels.forEach(panel => {
    shadingComponents.forEach(shader => {
      const distance = Math.sqrt(
        Math.pow(panel.position[0] - shader.position[0], 2) +
        Math.pow(panel.position[2] - shader.position[2], 2)
      )
      
      // Shading decreases with distance
      const shadingFactor = Math.max(0, 1 - (distance / 10)) // 10m influence radius
      totalShading += shadingFactor * (shader.area / roofArea)
    })
  })
  
  return Math.min(0.5, totalShading / solarPanels.length) // Cap at 50% shading
}

// Get weather data for a location
export function getWeatherData(location: string): WeatherData | null {
  return weatherDatabase[location] || null
}

// Calculate optimal component placement based on weather
export function getOptimalPlacement(
  weatherData: WeatherData,
  componentType: string
): { position: [number, number, number], rotation: [number, number, number] } {
  switch (componentType) {
    case 'solar':
      return {
        position: [0, 8.1, 0], // Center of roof
        rotation: [0, weatherData.solar.optimalAzimuth * Math.PI / 180, weatherData.solar.optimalTilt * Math.PI / 180]
      }
    case 'hvac':
      // Place HVAC away from solar panels and near edges
      return {
        position: [-8, 8.1, -6],
        rotation: [0, 0, 0]
      }
    case 'skylight':
      // Place skylights for optimal daylight
      return {
        position: [0, 8.1, 0],
        rotation: [0, 0, 0]
      }
    default:
      return {
        position: [0, 8.1, 0],
        rotation: [0, 0, 0]
      }
  }
}

// Generate weather-based recommendations
export function generateWeatherRecommendations(
  weatherData: WeatherData,
  _components: Array<{type: string, area: number}>
): string[] {
  const recommendations = []
  
  // Solar recommendations
  if (weatherData.solar.annualIrradiance > 1500) {
    recommendations.push('High solar potential - consider maximizing solar panel coverage')
  } else if (weatherData.solar.annualIrradiance < 1200) {
    recommendations.push('Lower solar potential - focus on energy efficiency measures')
  }
  
  // Wind recommendations
  if (weatherData.wind.average > 15) {
    recommendations.push('High wind area - ensure all components are properly secured')
  }
  
  // Temperature recommendations
  if (weatherData.temperature.max > 35) {
    recommendations.push('Hot climate - consider reflective roofing materials and increased ventilation')
  } else if (weatherData.temperature.min < -10) {
    recommendations.push('Cold climate - ensure proper insulation and freeze protection')
  }
  
  // Precipitation recommendations
  if (weatherData.precipitation.annual > 1000) {
    recommendations.push('High rainfall - ensure proper drainage and waterproofing')
  }
  
  return recommendations
}

// Calculate energy performance
export function calculateEnergyPerformance(
  components: Array<{type: string, area: number}>,
  weatherData: WeatherData
): {
  heatingLoad: number // BTU/year
  coolingLoad: number // BTU/year
  lightingLoad: number // kWh/year
  totalEnergyUse: number // kWh/year
} {
  const buildingArea = 300 // sq ft (example)
  
  // Calculate heating load (simplified)
  const heatingDegreeDays = Math.max(0, 65 - weatherData.temperature.average) * 365
  const heatingLoad = buildingArea * heatingDegreeDays * 0.5 // BTU/year
  
  // Calculate cooling load (simplified)
  const coolingDegreeDays = Math.max(0, weatherData.temperature.average - 65) * 365
  const coolingLoad = buildingArea * coolingDegreeDays * 0.3 // BTU/year
  
  // Calculate lighting load
  const skylights = components.filter(c => c.type === 'skylight')
  const skylightArea = skylights.reduce((sum, c) => sum + c.area, 0)
  const naturalLightingFactor = Math.min(0.8, skylightArea / buildingArea * 2)
  const lightingLoad = buildingArea * 2 * (1 - naturalLightingFactor) * 365 // kWh/year
  
  // Convert BTU to kWh (1 BTU = 0.000293 kWh)
  const totalEnergyUse = (heatingLoad + coolingLoad) * 0.000293 + lightingLoad
  
  return {
    heatingLoad,
    coolingLoad,
    lightingLoad,
    totalEnergyUse
  }
}
