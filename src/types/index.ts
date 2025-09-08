export type ZoneType = 'GREEN' | 'SOLAR' | 'WATER' | 'SOCIAL';

export interface RoofFootprint {
  id: string;
  projectId: string;
  polygonWKT: string;
  tiltDeg?: number;
  orientationDeg?: number;
  parapetSetbackM?: number;
  structuralCapKgM2?: number;
  createdAt: number;
}

export interface ZoneBlock {
  id: string;
  type: ZoneType;
  polygonWKT: string;
  locked?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  id: string;
  roofId: string;
  name: string;
  blocks: ZoneBlock[];
  constraintsOk: boolean;
  kpis: KpiSnapshot;
  createdBy: string;
  createdAt: number;
}

export interface KpiSnapshot {
  areaTotalM2: number;
  greenAreaM2: number;
  solarAreaM2: number;
  waterAreaM2: number;
  socialAreaM2: number;
  kWhPerYear?: number;
  waterRetentionM3?: number;
  co2DeltaTonsYr?: number;
  capexDkk?: number;
  paybackYears?: number;
  feasibilityFlags: string[];
}

export interface Project {
  id: string;
  name: string;
  address: string;
  branchId: string;
  createdBy: string;
  createdAt: number;
}

export type Priority = 'CO2' | 'ENERGY' | 'BIODIVERSITY';

export interface PresetSplit {
  SOLAR: number;
  GREEN: number;
  WATER: number;
  SOCIAL: number;
}

export const PRESET_SPLITS: Record<Priority, PresetSplit> = {
  CO2: { SOLAR: 0.45, GREEN: 0.35, WATER: 0.15, SOCIAL: 0.05 },
  ENERGY: { SOLAR: 0.60, GREEN: 0.20, WATER: 0.15, SOCIAL: 0.05 },
  BIODIVERSITY: { SOLAR: 0.30, GREEN: 0.50, WATER: 0.15, SOCIAL: 0.05 },
};