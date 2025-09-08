import { Layout, KpiSnapshot, ZoneBlock } from '../types';

// Regional factors for Denmark
const REGIONAL_FACTORS = {
  solarIrradianceKWhM2: 1000, // Annual solar irradiance
  gridCO2KgKWh: 0.2, // Grid CO2 intensity
  rainfallMmYear: 600, // Annual rainfall
  pvSystemEfficiency: 0.18, // Panel efficiency
  pvSystemLosses: 0.15, // System losses
};

// Cost factors (DKK per m²)
const COST_FACTORS = {
  GREEN: 800,
  SOLAR: 1500,
  WATER: 600,
  SOCIAL: 400,
};

export function calculateKPIs(layout: Layout): KpiSnapshot {
  const blocks = layout.blocks;
  
  // Calculate areas
  const greenAreaM2 = sumAreaByType(blocks, 'GREEN');
  const solarAreaM2 = sumAreaByType(blocks, 'SOLAR');
  const waterAreaM2 = sumAreaByType(blocks, 'WATER');
  const socialAreaM2 = sumAreaByType(blocks, 'SOCIAL');
  const areaTotalM2 = greenAreaM2 + solarAreaM2 + waterAreaM2 + socialAreaM2;

  // Solar energy calculation
  const kWhPerYear = solarAreaM2 * 
    REGIONAL_FACTORS.solarIrradianceKWhM2 * 
    REGIONAL_FACTORS.pvSystemEfficiency * 
    (1 - REGIONAL_FACTORS.pvSystemLosses);

  // Water retention calculation
  const waterRetentionM3 = (greenAreaM2 + waterAreaM2) * 
    (REGIONAL_FACTORS.rainfallMmYear / 1000) * 0.7; // 70% retention factor

  // CO2 impact calculation
  const co2FromSolar = kWhPerYear * REGIONAL_FACTORS.gridCO2KgKWh / 1000; // tons/year
  const co2FromGreen = greenAreaM2 * 0.02; // 20kg CO2/m²/year sequestration
  const co2DeltaTonsYr = co2FromSolar + co2FromGreen;

  // Cost calculation
  const capexDkk = 
    greenAreaM2 * COST_FACTORS.GREEN +
    solarAreaM2 * COST_FACTORS.SOLAR +
    waterAreaM2 * COST_FACTORS.WATER +
    socialAreaM2 * COST_FACTORS.SOCIAL;

  // Payback calculation (simplified)
  const annualSavings = kWhPerYear * 2.5; // 2.5 DKK/kWh
  const paybackYears = capexDkk > 0 ? capexDkk / annualSavings : 0;

  // Feasibility checks
  const feasibilityFlags: string[] = [];
  if (solarAreaM2 > 0 && solarAreaM2 < 10) {
    feasibilityFlags.push('Solar area too small for efficient installation');
  }
  if (areaTotalM2 < 50) {
    feasibilityFlags.push('Roof area may be too small for mixed-use design');
  }

  return {
    areaTotalM2,
    greenAreaM2,
    solarAreaM2,
    waterAreaM2,
    socialAreaM2,
    kWhPerYear,
    waterRetentionM3,
    co2DeltaTonsYr,
    capexDkk,
    paybackYears,
    feasibilityFlags,
  };
}

function sumAreaByType(blocks: ZoneBlock[], type: string): number {
  return blocks
    .filter(block => block.type === type)
    .reduce((sum, block) => sum + (block.width * block.height), 0);
}