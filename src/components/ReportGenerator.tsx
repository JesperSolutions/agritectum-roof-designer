import { useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { BillOfMaterials, PerformanceMetrics, generateBillOfMaterials, calculatePerformanceMetrics, generateCostSummary, exportToCSV } from '../lib/analytics/cost-estimation'
import { RoofComponent } from './RoofComponents'

interface ReportGeneratorProps {
  components: RoofComponent[]
  onClose: () => void
  quality?: 'draft' | 'high'
}

export function ReportGenerator({ components, onClose, quality: _quality = 'high' }: ReportGeneratorProps) {
  const { gl } = useThree()
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'csv'>('summary')
  const [show3DView, setShow3DView] = useState(true)
  const [cameraAngle, setCameraAngle] = useState<'top' | 'isometric' | 'front'>('top')
  
  const bom = generateBillOfMaterials(components)
  const metrics = calculatePerformanceMetrics(components)

  // Generate different report views
  const generateReport = () => {
    switch (reportType) {
      case 'summary':
        return generateCostSummary(bom, metrics)
      case 'detailed':
        return generateDetailedReport(bom, metrics, components)
      case 'csv':
        return exportToCSV(bom)
      default:
        return ''
    }
  }

  const downloadReport = () => {
    const content = generateReport()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `roof_design_report_${Date.now()}.${reportType === 'csv' ? 'csv' : 'txt'}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const capture3DView = () => {
    const canvas = gl.domElement
    const link = document.createElement('a')
    link.download = `roof_design_3d_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #eee',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>📊 Roof Design Report</h2>
          <button
            onClick={onClose}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Report Type Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Report Type:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="csv">CSV Export</option>
          </select>
        </div>

        {/* 3D View Controls */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '15px' }}>3D View:</label>
          <button
            onClick={() => setShow3DView(!show3DView)}
            style={{
              background: show3DView ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginRight: '10px',
              fontSize: '12px'
            }}
          >
            {show3DView ? 'Hide' : 'Show'} 3D View
          </button>
          
          <select
            value={cameraAngle}
            onChange={(e) => setCameraAngle(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '12px'
            }}
          >
            <option value="top">Top View</option>
            <option value="isometric">Isometric View</option>
            <option value="front">Front View</option>
          </select>
        </div>

        {/* Report Content */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {generateReport()}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={downloadReport}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            💾 Download Report
          </button>
          
          <button
            onClick={capture3DView}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📸 Capture 3D View
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              ${bom.totalCost.toFixed(0)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Cost</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#e8f5e8', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {metrics.totalArea.toFixed(0)} sq ft
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Area</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {metrics.energyEfficiency.toFixed(0)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Energy Efficiency</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#fce4ec', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
              {components.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Components</div>
          </div>
        </div>
      </div>
    </Html>
  )
}

// Generate detailed report
function generateDetailedReport(bom: BillOfMaterials, metrics: PerformanceMetrics, components: RoofComponent[]): string {
  return `
DETAILED ROOF DESIGN REPORT
===========================

PROJECT OVERVIEW
================
Generated: ${new Date().toLocaleString()}
Total Components: ${components.length}
Design Area: ${metrics.totalArea.toFixed(1)} sq ft

COST BREAKDOWN
==============
Materials: $${bom.subtotal.toFixed(2)}
Labor (40%): $${bom.laborCost.toFixed(2)}
Overhead (10%): $${bom.overhead.toFixed(2)}
TOTAL: $${bom.totalCost.toFixed(2)}

COMPONENT DETAILS
=================
${bom.items.map(item => `
${item.name}
  Category: ${item.category}
  Quantity: ${item.quantity.toFixed(2)} ${item.unit}
  Unit Cost: $${item.unitCost.toFixed(2)}
  Total Cost: $${item.totalCost.toFixed(2)}
  Material: ${item.material}
  Specifications: ${item.specifications}
`).join('\n')}

PERFORMANCE ANALYSIS
===================
Solar Potential: ${metrics.solarPotential.toFixed(0)} kWh/year
Energy Efficiency: ${metrics.energyEfficiency.toFixed(1)}%
Annual Maintenance: $${metrics.maintenanceCost.toFixed(2)}
20-Year Lifecycle: $${metrics.lifecycleCost.toFixed(2)}
Carbon Footprint: ${metrics.carbonFootprint.toFixed(2)} tons CO2

SUSTAINABILITY SCORE
====================
${calculateSustainabilityScore(metrics)}

RECOMMENDATIONS
===============
${generateRecommendations(metrics, components)}

This report was generated by the Industrial Roof Designer.
For questions or support, contact your design team.
  `.trim()
}

function calculateSustainabilityScore(metrics: PerformanceMetrics): string {
  let score = 0
  
  // Solar potential (0-40 points)
  score += Math.min(40, (metrics.solarPotential / 1000) * 4)
  
  // Energy efficiency (0-30 points)
  score += (metrics.energyEfficiency / 100) * 30
  
  // Low maintenance (0-20 points)
  score += Math.max(0, 20 - (metrics.maintenanceCost / 100))
  
  // Low carbon footprint (0-10 points)
  score += Math.max(0, 10 - (metrics.carbonFootprint * 2))
  
  const rating = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement'
  
  return `${rating} (${score.toFixed(0)}/100 points)`
}

function generateRecommendations(metrics: PerformanceMetrics, components: RoofComponent[]): string {
  const recommendations = []
  
  if (metrics.solarPotential < 500) {
    recommendations.push('• Consider adding more solar panels to increase renewable energy generation')
  }
  
  if (metrics.energyEfficiency < 60) {
    recommendations.push('• Add more energy-efficient components like skylights and better HVAC units')
  }
  
  if (metrics.maintenanceCost > 1000) {
    recommendations.push('• Consider more durable materials to reduce long-term maintenance costs')
  }
  
  if (components.filter(c => c.type === 'hvac').length === 0) {
    recommendations.push('• Add HVAC units for proper building climate control')
  }
  
  if (components.filter(c => c.type === 'skylight').length === 0) {
    recommendations.push('• Consider adding skylights for natural lighting and energy savings')
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '• Design looks well-balanced and efficient!'
}
