import React, { useEffect } from 'react';
import { usePlannerStore } from '../store/planner-store';
import { PresetPicker } from './PresetPicker';
import { KpiPanel } from './KpiPanel';
import { Canvas2D } from './Canvas2D';
import { Actions } from './Actions';

export function RoofPlanner() {
  const { currentLayout, updateBlocks, applyPreset } = usePlannerStore();

  // Initialize with CO2 preset on first load
  useEffect(() => {
    if (!currentLayout) {
      applyPreset('CO2');
    }
  }, [currentLayout, applyPreset]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agritectum Roof Designer
          </h1>
          <p className="text-gray-600">
            Design sustainable roof layouts with instant performance metrics
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Canvas Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Roof Layout</h2>
              {currentLayout ? (
                <Canvas2D
                  blocks={currentLayout.blocks}
                  onBlocksChange={updateBlocks}
                />
              ) : (
                <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Select a preset to start designing</p>
                </div>
              )}
            </div>

            {/* Zone Summary */}
            {currentLayout && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Zone Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentLayout.blocks.map((block) => (
                    <div key={block.id} className="text-center">
                      <div className={`w-full h-8 rounded mb-2 zone-${block.type.toLowerCase()}`} />
                      <div className="text-sm font-medium">{block.type}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(block.width * block.height)} m²
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PresetPicker />
            <KpiPanel />
            <Actions />
          </div>
        </div>
      </div>
    </div>
  );
}