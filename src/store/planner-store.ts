import { create } from 'zustand';
import { Layout, ZoneBlock, KpiSnapshot, Priority, PRESET_SPLITS } from '../types';
import { calculateKPIs } from '../lib/kpi-engine';
import { generateId } from '../lib/utils';

interface PlannerState {
  currentLayout: Layout | null;
  selectedPriority: Priority;
  isOptimizing: boolean;
  
  // Actions
  setLayout: (layout: Layout) => void;
  setPriority: (priority: Priority) => void;
  updateBlocks: (blocks: ZoneBlock[]) => void;
  applyPreset: (priority: Priority) => void;
  optimizeLayout: () => Promise<void>;
  resetLayout: () => void;
}

const DEFAULT_ROOF_SIZE = { width: 200, height: 150 }; // 30,000 m² roof

export const usePlannerStore = create<PlannerState>((set, get) => ({
  currentLayout: null,
  selectedPriority: 'CO2',
  isOptimizing: false,

  setLayout: (layout) => set({ currentLayout: layout }),

  setPriority: (priority) => set({ selectedPriority: priority }),

  updateBlocks: (blocks) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      blocks,
      kpis: calculateKPIs({ ...currentLayout, blocks }),
    };

    set({ currentLayout: updatedLayout });
  },

  applyPreset: (priority) => {
    const split = PRESET_SPLITS[priority];
    const { width, height } = DEFAULT_ROOF_SIZE;
    const totalArea = width * height;

    const blocks: ZoneBlock[] = [];
    let currentY = 0;

    // Create blocks based on preset percentages
    Object.entries(split).forEach(([type, percentage]) => {
      const blockHeight = height * percentage;
      blocks.push({
        id: generateId(),
        type: type as any,
        polygonWKT: '', // Will be calculated from x,y,width,height
        x: 0,
        y: currentY,
        width,
        height: blockHeight,
      });
      currentY += blockHeight;
    });

    const layout: Layout = {
      id: generateId(),
      roofId: 'demo-roof',
      name: `${priority} Layout`,
      blocks,
      constraintsOk: true,
      kpis: calculateKPIs({ blocks } as Layout),
      createdBy: 'user',
      createdAt: Date.now(),
    };

    set({ 
      currentLayout: layout,
      selectedPriority: priority 
    });
  },

  optimizeLayout: async () => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    set({ isOptimizing: true });

    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple optimization: slightly adjust block sizes for better KPIs
    const optimizedBlocks = currentLayout.blocks.map(block => ({
      ...block,
      width: block.width * (0.95 + Math.random() * 0.1), // ±5% variation
      height: block.height * (0.95 + Math.random() * 0.1),
    }));

    const optimizedLayout = {
      ...currentLayout,
      id: generateId(),
      name: `${currentLayout.name} (Optimized)`,
      blocks: optimizedBlocks,
      kpis: calculateKPIs({ ...currentLayout, blocks: optimizedBlocks }),
    };

    set({ 
      currentLayout: optimizedLayout,
      isOptimizing: false 
    });
  },

  resetLayout: () => {
    set({ currentLayout: null });
  },
}));