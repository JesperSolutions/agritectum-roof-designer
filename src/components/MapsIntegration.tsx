import React, { useState, useRef, useEffect } from 'react'
import { BuildingFootprint, searchBuildings, footprintToRoofParams } from '../lib/maps/building-data'

interface MapsIntegrationProps {
  onBuildingSelect: (footprint: BuildingFootprint) => void
  onClose: () => void
}

export function MapsIntegration({ onBuildingSelect, onClose }: MapsIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [buildings, setBuildings] = useState<BuildingFootprint[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingFootprint | null>(null)
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')
  const mapRef = useRef<HTMLDivElement>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    
    try {
      // Call the real OpenStreetMap API
      const foundBuildings = await searchBuildings(searchQuery)
      setBuildings(foundBuildings)
    } catch (error) {
      console.error('Error searching buildings:', error)
      // Fallback to empty array - the API will provide mock data if needed
      setBuildings([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuildingClick = (building: BuildingFootprint) => {
    setSelectedBuilding(building)
  }

  const handleGenerateRoof = () => {
    if (selectedBuilding) {
      // Convert units if needed
      const buildingWithUnits = {
        ...selectedBuilding,
        units
      }
      onBuildingSelect(buildingWithUnits)
      onClose()
    }
  }

  const toggleUnits = () => {
    setUnits(prev => prev === 'metric' ? 'imperial' : 'metric')
  }

  const formatArea = (area: number, units: 'metric' | 'imperial') => {
    if (units === 'imperial') {
      const sqft = area * 10.764 // Convert m² to ft²
      return `${Math.round(sqft).toLocaleString()} ft²`
    }
    return `${area.toLocaleString()} m²`
  }

  const formatDimensions = (width: number, depth: number, units: 'metric' | 'imperial') => {
    if (units === 'imperial') {
      const ftWidth = width * 3.281 // Convert m to ft
      const ftDepth = depth * 3.281
      return `${Math.round(ftWidth)}' × ${Math.round(ftDepth)}'`
    }
    return `${width}m × ${depth}m`
  }

  const formatHeight = (height: number, units: 'metric' | 'imperial') => {
    if (units === 'imperial') {
      const ft = height * 3.281
      return `${Math.round(ft)} ft`
    }
    return `${height}m`
  }

  const getBuildingTypeIcon = (type: string) => {
    switch (type) {
      case 'industrial': return '🏭'
      case 'warehouse': return '🏬'
      case 'commercial': return '🏢'
      case 'office': return '🏢'
      case 'residential': return '🏠'
      default: return '🏢'
    }
  }

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'rectangular': return '⬜'
      case 'l-shaped': return '🔲'
      case 'u-shaped': return '🔳'
      case 'circular': return '⭕'
      case 'irregular': return '🔷'
      default: return '⬜'
    }
  }

  const getSolarPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return '#4CAF50'
      case 'medium': return '#FF9800'
      case 'low': return '#F44336'
      default: return '#666'
    }
  }

  const getRoofConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#4CAF50'
      case 'good': return '#8BC34A'
      case 'fair': return '#FF9800'
      case 'poor': return '#F44336'
      default: return '#666'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Find Your Building</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Units:</span>
              <button
                onClick={toggleUnits}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: units === 'metric' ? '#2196F3' : 'white',
                  color: units === 'metric' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {units === 'metric' ? 'Metric (m)' : 'Imperial (ft)'}
              </button>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Search Interface */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter address or coordinates..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Map Placeholder */}
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '300px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px'
            }}
          >
            {isLoading ? 'Loading map...' : 'Map will appear here (OpenStreetMap integration)'}
          </div>
        </div>

        {/* Building Results */}
        {buildings.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Found Buildings:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {buildings.map((building) => (
                <div
                  key={building.id}
                  onClick={() => handleBuildingClick(building)}
                  style={{
                    padding: '16px',
                    border: selectedBuilding?.id === building.id ? '2px solid #2196F3' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedBuilding?.id === building.id ? '#f0f8ff' : 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedBuilding?.id === building.id ? '0 4px 12px rgba(33, 150, 243, 0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                      {getBuildingTypeIcon(building.buildingType || 'industrial')} {building.address || `Building ${building.id}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {getShapeIcon(building.shape)} {building.shape}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Dimensions:</strong> {formatDimensions(building.width, building.depth, building.units)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Area:</strong> {formatArea(building.area, building.units)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Height:</strong> {formatHeight(building.height || 0, building.units)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Floors:</strong> {building.floors || 'N/A'}
                    </div>
                  </div>

                  {/* Building Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Type:</strong> {building.buildingType || 'Unknown'} ({building.units || 0} units)
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Material:</strong> {building.material || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Built:</strong> {building.yearBuilt || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Perimeter:</strong> {building.perimeter || 0}m
                    </div>
                  </div>

                  {/* Roof Information */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Roof Type:</strong> {building.roofType || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Roof Material:</strong> {building.roofMaterial || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Roof Condition:</strong> 
                      <span style={{ 
                        color: getRoofConditionColor(building.roofCondition || 'fair'),
                        fontWeight: 'bold',
                        marginLeft: '4px'
                      }}>
                        {building.roofCondition || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>Solar Potential:</strong>
                      <span style={{ 
                        color: getSolarPotentialColor(building.solarPotential || 'medium'),
                        fontWeight: 'bold',
                        marginLeft: '4px'
                      }}>
                        {building.solarPotential || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {building.tags && Object.keys(building.tags).length > 0 && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        <strong>Additional Info:</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Object.entries(building.tags).slice(0, 5).map(([key, value]) => (
                          <span key={key} style={{ 
                            background: '#e9ecef', 
                            padding: '2px 6px', 
                            borderRadius: '3px',
                            fontSize: '10px'
                          }}>
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateRoof}
            disabled={!selectedBuilding}
            style={{
              padding: '12px 24px',
              background: selectedBuilding ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedBuilding ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Generate Roof Design
          </button>
        </div>

        {/* Info Panel */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>How it works:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Search for your building address or coordinates</li>
            <li>Select your building from the results</li>
            <li>Our tool will auto-generate a roof design based on your building's footprint</li>
            <li>You can then customize the roof components and materials</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
