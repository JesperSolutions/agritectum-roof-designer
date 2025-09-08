#!/usr/bin/env python3
"""
3D Roof Analysis Tool
Companion Python script for advanced roof calculations and optimization
"""

import math
import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict

@dataclass
class RoofDimensions:
    """Roof physical dimensions"""
    width: float  # meters
    length: float  # meters
    pitch: float  # degrees
    height: float  # calculated peak height
    area: float   # total roof surface area

@dataclass
class Zone:
    """Roof zone definition"""
    type: str  # 'solar', 'green', 'water', 'social'
    x: float   # position x
    z: float   # position z
    size: float # zone size (square)
    area: float # zone area
    efficiency: float # zone-specific efficiency factor

@dataclass
class PerformanceMetrics:
    """Calculated performance metrics"""
    total_area: float
    solar_area: float
    green_area: float
    water_area: float
    social_area: float
    energy_kwh_year: float
    water_retention_m3: float
    co2_reduction_tons: float
    cost_estimate: float
    payback_years: float

class RoofAnalyzer:
    """Advanced 3D roof analysis and optimization"""
    
    # Regional factors for Denmark
    SOLAR_IRRADIANCE = 1000  # kWh/m²/year
    PANEL_EFFICIENCY = 0.20  # 20% efficiency
    SYSTEM_LOSSES = 0.15     # 15% system losses
    RAINFALL_MM = 600        # mm/year
    GRID_CO2_KG_KWH = 0.2   # kg CO2/kWh
    
    # Cost factors (EUR/m²)
    COSTS = {
        'solar': 1500,
        'green': 800,
        'water': 600,
        'social': 400
    }
    
    def __init__(self):
        self.roof: Optional[RoofDimensions] = None
        self.zones: List[Zone] = []
    
    def create_roof(self, width: float, length: float, pitch: float) -> RoofDimensions:
        """Create roof with given dimensions"""
        height = math.tan(math.radians(pitch)) * (width / 2)
        
        # Calculate actual roof surface area (accounting for pitch)
        slope_length = math.sqrt((width/2)**2 + height**2)
        area = 2 * slope_length * length  # Two slopes
        
        self.roof = RoofDimensions(
            width=width,
            length=length,
            pitch=pitch,
            height=height,
            area=area
        )
        return self.roof
    
    def add_zone(self, zone_type: str, x: float, z: float, size: float) -> Zone:
        """Add a zone to the roof"""
        # Calculate efficiency based on position and type
        efficiency = self._calculate_zone_efficiency(zone_type, x, z, size)
        
        zone = Zone(
            type=zone_type,
            x=x,
            z=z,
            size=size,
            area=size * size,
            efficiency=efficiency
        )
        
        self.zones.append(zone)
        return zone
    
    def _calculate_zone_efficiency(self, zone_type: str, x: float, z: float, size: float) -> float:
        """Calculate zone efficiency based on position and type"""
        if not self.roof:
            return 1.0
        
        # Base efficiency
        efficiency = 1.0
        
        if zone_type == 'solar':
            # Solar panels are more efficient on south-facing slopes
            # and less efficient near edges due to shading
            edge_distance = min(
                abs(x + self.roof.width/2),
                abs(x - self.roof.width/2),
                abs(z + self.roof.length/2),
                abs(z - self.roof.length/2)
            )
            
            # Reduce efficiency near edges
            if edge_distance < 2:
                efficiency *= 0.8
            
            # Optimal tilt angle consideration
            optimal_tilt = 37  # degrees for Denmark
            tilt_factor = 1 - abs(self.roof.pitch - optimal_tilt) / 100
            efficiency *= max(0.7, tilt_factor)
        
        elif zone_type == 'green':
            # Green roofs perform better with good drainage
            # Slightly better performance on slopes
            slope_factor = 1 + (self.roof.pitch / 100)
            efficiency *= min(1.2, slope_factor)
        
        return efficiency
    
    def calculate_performance(self) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        if not self.roof:
            raise ValueError("No roof defined")
        
        # Calculate areas by type
        areas = {'solar': 0, 'green': 0, 'water': 0, 'social': 0}
        for zone in self.zones:
            areas[zone.type] += zone.area
        
        # Energy calculation
        solar_energy = 0
        for zone in self.zones:
            if zone.type == 'solar':
                energy = (zone.area * self.SOLAR_IRRADIANCE * 
                         self.PANEL_EFFICIENCY * zone.efficiency * 
                         (1 - self.SYSTEM_LOSSES))
                solar_energy += energy
        
        # Water retention calculation
        retention_area = areas['green'] + areas['water']
        water_retention = (retention_area * self.RAINFALL_MM / 1000 * 0.7)  # 70% retention
        
        # CO2 reduction calculation
        co2_from_solar = solar_energy * self.GRID_CO2_KG_KWH / 1000  # tons/year
        co2_from_green = areas['green'] * 0.02  # 20kg CO2/m²/year sequestration
        co2_total = co2_from_solar + co2_from_green
        
        # Cost calculation
        total_cost = sum(areas[zone_type] * self.COSTS[zone_type] 
                        for zone_type in areas.keys())
        
        # Payback calculation
        annual_savings = solar_energy * 0.25  # €0.25/kWh
        payback_years = total_cost / annual_savings if annual_savings > 0 else float('inf')
        
        return PerformanceMetrics(
            total_area=self.roof.area,
            solar_area=areas['solar'],
            green_area=areas['green'],
            water_area=areas['water'],
            social_area=areas['social'],
            energy_kwh_year=solar_energy,
            water_retention_m3=water_retention,
            co2_reduction_tons=co2_total,
            cost_estimate=total_cost,
            payback_years=payback_years
        )
    
    def optimize_layout(self, priority: str = 'energy') -> List[Zone]:
        """Optimize zone layout based on priority"""
        if not self.roof:
            raise ValueError("No roof defined")
        
        # Clear existing zones
        self.zones = []
        
        # Define optimization parameters based on priority
        if priority == 'energy':
            zone_weights = {'solar': 0.6, 'green': 0.2, 'water': 0.15, 'social': 0.05}
        elif priority == 'environment':
            zone_weights = {'solar': 0.3, 'green': 0.5, 'water': 0.15, 'social': 0.05}
        elif priority == 'balanced':
            zone_weights = {'solar': 0.4, 'green': 0.35, 'water': 0.15, 'social': 0.1}
        else:
            zone_weights = {'solar': 0.4, 'green': 0.35, 'water': 0.15, 'social': 0.1}
        
        # Generate optimized zones
        total_zones = 12
        for i in range(total_zones):
            # Select zone type based on weights
            zone_type = self._weighted_choice(zone_weights)
            
            # Find optimal position for this zone type
            x, z = self._find_optimal_position(zone_type)
            size = 3 + (i % 3)  # Vary size between 3-5m
            
            self.add_zone(zone_type, x, z, size)
        
        return self.zones
    
    def _weighted_choice(self, weights: Dict[str, float]) -> str:
        """Choose zone type based on weights"""
        import random
        total = sum(weights.values())
        r = random.random() * total
        
        cumulative = 0
        for zone_type, weight in weights.items():
            cumulative += weight
            if r <= cumulative:
                return zone_type
        
        return list(weights.keys())[0]  # fallback
    
    def _find_optimal_position(self, zone_type: str) -> Tuple[float, float]:
        """Find optimal position for zone type"""
        import random
        
        if zone_type == 'solar':
            # Solar panels prefer south-facing areas (positive z)
            x = (random.random() - 0.5) * self.roof.width * 0.6
            z = random.random() * self.roof.length * 0.4
        elif zone_type == 'social':
            # Social areas prefer accessible edges
            x = (random.random() - 0.5) * self.roof.width * 0.8
            z = (random.random() - 0.5) * self.roof.length * 0.8
        else:
            # Green and water can be anywhere
            x = (random.random() - 0.5) * self.roof.width * 0.7
            z = (random.random() - 0.5) * self.roof.length * 0.7
        
        return x, z
    
    def export_to_json(self, filename: str = 'roof_design.json'):
        """Export roof design to JSON"""
        data = {
            'roof': asdict(self.roof) if self.roof else None,
            'zones': [asdict(zone) for zone in self.zones],
            'performance': asdict(self.calculate_performance()) if self.roof else None
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Roof design exported to {filename}")
    
    def generate_report(self) -> str:
        """Generate detailed analysis report"""
        if not self.roof:
            return "No roof design available"
        
        metrics = self.calculate_performance()
        
        report = f"""
3D ROOF ANALYSIS REPORT
=======================

Roof Specifications:
- Dimensions: {self.roof.width}m × {self.roof.length}m
- Pitch: {self.roof.pitch}°
- Peak Height: {self.roof.height:.1f}m
- Total Surface Area: {self.roof.area:.1f}m²

Zone Distribution:
- Solar Panels: {metrics.solar_area:.1f}m² ({metrics.solar_area/metrics.total_area*100:.1f}%)
- Green Roof: {metrics.green_area:.1f}m² ({metrics.green_area/metrics.total_area*100:.1f}%)
- Water Management: {metrics.water_area:.1f}m² ({metrics.water_area/metrics.total_area*100:.1f}%)
- Social Spaces: {metrics.social_area:.1f}m² ({metrics.social_area/metrics.total_area*100:.1f}%)

Performance Metrics:
- Energy Production: {metrics.energy_kwh_year:.0f} kWh/year
- Water Retention: {metrics.water_retention_m3:.1f} m³/year
- CO₂ Reduction: {metrics.co2_reduction_tons:.1f} tons/year
- Investment Cost: €{metrics.cost_estimate:.0f}
- Payback Period: {metrics.payback_years:.1f} years

Zone Details:
"""
        
        for i, zone in enumerate(self.zones, 1):
            report += f"  {i}. {zone.type.title()} Zone: {zone.area:.1f}m² (efficiency: {zone.efficiency:.2f})\n"
        
        return report

def main():
    """Example usage of the RoofAnalyzer"""
    print("3D Roof Analysis Tool")
    print("====================")
    
    # Create analyzer
    analyzer = RoofAnalyzer()
    
    # Create a sample roof
    roof = analyzer.create_roof(width=50, length=40, pitch=15)
    print(f"Created roof: {roof.width}m × {roof.length}m, pitch {roof.pitch}°")
    
    # Optimize layout
    print("\nOptimizing layout for energy production...")
    zones = analyzer.optimize_layout('energy')
    print(f"Generated {len(zones)} zones")
    
    # Calculate performance
    metrics = analyzer.calculate_performance()
    print(f"\nPerformance Summary:")
    print(f"- Energy: {metrics.energy_kwh_year:.0f} kWh/year")
    print(f"- CO₂ Reduction: {metrics.co2_reduction_tons:.1f} tons/year")
    print(f"- Investment: €{metrics.cost_estimate:.0f}")
    print(f"- Payback: {metrics.payback_years:.1f} years")
    
    # Generate full report
    report = analyzer.generate_report()
    print("\n" + report)
    
    # Export design
    analyzer.export_to_json()

if __name__ == "__main__":
    main()