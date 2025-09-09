import { industrialMaterials } from '../materials/industrial-materials'
import { RoofComponent } from '../../components/RoofComponents'

// Cost estimation and bill of materials
export interface CostItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  material: string
  specifications: string
}

export interface BillOfMaterials {
  items: CostItem[]
  subtotal: number
  laborCost: number
  overhead: number
  totalCost: number
  currency: string
  lastUpdated: string
}

export interface PerformanceMetrics {
  totalArea: number
  solarPotential: number // kWh/year
  energyEfficiency: number // 0-100
  maintenanceCost: number // per year
  lifecycleCost: number // 20-year total
  carbonFootprint: number // tons CO2
}

// Calculate component costs
export function calculateComponentCost(component: RoofComponent): CostItem {
  const baseArea = getComponentArea(component)
  const material = industrialMaterials[component.type as keyof typeof industrialMaterials]
  
  if (!material) {
    return {
      id: component.id,
      name: component.type,
      category: 'Unknown',
      quantity: 1,
      unit: 'each',
      unitCost: 0,
      totalCost: 0,
      material: 'Unknown',
      specifications: 'No specifications available'
    }
  }

  const unitCost = material.price
  const totalCost = unitCost * baseArea

  return {
    id: component.id,
    name: getComponentDisplayName(component.type),
    category: getComponentCategory(component.type),
    quantity: baseArea,
    unit: 'sq ft',
    unitCost,
    totalCost,
    material: material.name,
    specifications: material.description
  }
}

// Get component area based on type and scale
function getComponentArea(component: RoofComponent): number {
  const baseAreas = {
    hvac: 4, // 2x2 feet
    skylight: 6, // 3x2 feet
    solar: 2, // 2x1 feet per panel
    vent: 0.5, // 0.5x0.5 feet
    antenna: 0.25, // 0.5x0.5 feet
    water_tank: 7, // 3.5x2 feet
  }
  
  const baseArea = baseAreas[component.type] || 1
  const scale = component.scale[0] * component.scale[2] // X * Z scale
  return baseArea * scale
}

function getComponentDisplayName(type: string): string {
  const names = {
    hvac: 'HVAC Unit',
    skylight: 'Skylight',
    solar: 'Solar Panel',
    vent: 'Ventilation Unit',
    antenna: 'Communication Antenna',
    water_tank: 'Water Storage Tank'
  }
  return names[type as keyof typeof names] || type
}

function getComponentCategory(type: string): string {
  const categories = {
    hvac: 'Mechanical',
    skylight: 'Architectural',
    solar: 'Renewable Energy',
    vent: 'Mechanical',
    antenna: 'Communication',
    water_tank: 'Plumbing'
  }
  return categories[type as keyof typeof categories] || 'General'
}

// Generate complete bill of materials
export function generateBillOfMaterials(components: RoofComponent[]): BillOfMaterials {
  const items = components.map(calculateComponentCost)
  
  // Calculate labor costs (typically 30-50% of material cost)
  const materialCost = items.reduce((sum, item) => sum + item.totalCost, 0)
  const laborCost = materialCost * 0.4 // 40% labor markup
  
  // Calculate overhead (10% of total)
  const subtotal = materialCost + laborCost
  const overhead = subtotal * 0.1
  
  const totalCost = subtotal + overhead

  return {
    items,
    subtotal,
    laborCost,
    overhead,
    totalCost,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  }
}

// Calculate performance metrics
export function calculatePerformanceMetrics(components: RoofComponent[]): PerformanceMetrics {
  const totalArea = components.reduce((sum, comp) => sum + getComponentArea(comp), 0)
  
  // Solar potential calculation
  const solarPanels = components.filter(c => c.type === 'solar')
  const solarArea = solarPanels.reduce((sum, comp) => sum + getComponentArea(comp), 0)
  const solarPotential = solarArea * 150 // 150 kWh per sq ft per year (rough estimate)
  
  // Energy efficiency based on components
  const efficiencyFactors = {
    solar: 0.3,
    skylight: 0.1,
    hvac: -0.2, // HVAC consumes energy
    vent: -0.05,
    antenna: -0.01,
    water_tank: 0.0
  }
  
  const energyEfficiency = Math.max(0, Math.min(100, 
    50 + components.reduce((sum, comp) => {
      const factor = efficiencyFactors[comp.type as keyof typeof efficiencyFactors] || 0
      return sum + (factor * 10)
    }, 0)
  ))
  
  // Maintenance costs (annual)
  const maintenanceCost = components.reduce((sum, comp) => {
    const material = industrialMaterials[comp.type as keyof typeof industrialMaterials]
    if (material) {
      return sum + (material.price * getComponentArea(comp) * 0.05) // 5% of material cost annually
    }
    return sum
  }, 0)
  
  // Lifecycle cost (20 years)
  const lifecycleCost = (totalArea * 15) + (maintenanceCost * 20) // $15/sq ft + 20 years maintenance
  
  // Carbon footprint (tons CO2)
  const carbonFootprint = totalArea * 0.1 // Rough estimate: 0.1 tons CO2 per sq ft

  return {
    totalArea,
    solarPotential,
    energyEfficiency,
    maintenanceCost,
    lifecycleCost,
    carbonFootprint
  }
}

// Export data for reports
export function exportToCSV(bom: BillOfMaterials): string {
  const headers = ['Item', 'Category', 'Quantity', 'Unit', 'Unit Cost', 'Total Cost', 'Material', 'Specifications']
  const rows = bom.items.map(item => [
    item.name,
    item.category,
    item.quantity.toFixed(2),
    item.unit,
    `$${item.unitCost.toFixed(2)}`,
    `$${item.totalCost.toFixed(2)}`,
    item.material,
    item.specifications
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

// Generate cost summary
export function generateCostSummary(bom: BillOfMaterials, metrics: PerformanceMetrics): string {
  return `
ROOF DESIGN COST SUMMARY
========================

MATERIALS: $${bom.subtotal.toFixed(2)}
LABOR: $${bom.laborCost.toFixed(2)}
OVERHEAD: $${bom.overhead.toFixed(2)}
TOTAL COST: $${bom.totalCost.toFixed(2)}

PERFORMANCE METRICS
===================
Total Area: ${metrics.totalArea.toFixed(1)} sq ft
Solar Potential: ${metrics.solarPotential.toFixed(0)} kWh/year
Energy Efficiency: ${metrics.energyEfficiency.toFixed(1)}%
Annual Maintenance: $${metrics.maintenanceCost.toFixed(2)}
20-Year Lifecycle Cost: $${metrics.lifecycleCost.toFixed(2)}
Carbon Footprint: ${metrics.carbonFootprint.toFixed(2)} tons CO2

Generated: ${new Date().toLocaleString()}
  `.trim()
}

