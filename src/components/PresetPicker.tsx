import React from 'react';
import { Leaf, Zap, Droplets } from 'lucide-react';
import { Priority } from '../types';
import { usePlannerStore } from '../store/planner-store';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const PRIORITY_CONFIG = {
  CO2: {
    icon: Leaf,
    label: 'CO₂ Focused',
    description: 'Maximize carbon reduction',
    color: 'text-green-600',
  },
  ENERGY: {
    icon: Zap,
    label: 'Energy Focused',
    description: 'Maximize energy production',
    color: 'text-solar-600',
  },
  BIODIVERSITY: {
    icon: Droplets,
    label: 'Biodiversity Focused',
    description: 'Maximize green coverage',
    color: 'text-green-600',
  },
};

export function PresetPicker() {
  const { selectedPriority, applyPreset } = usePlannerStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start Presets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => {
          const Icon = config.icon;
          const isSelected = selectedPriority === priority;
          
          return (
            <Button
              key={priority}
              variant={isSelected ? 'default' : 'outline'}
              className="w-full justify-start h-auto p-4"
              onClick={() => applyPreset(priority as Priority)}
            >
              <Icon className={`w-5 h-5 mr-3 ${config.color}`} />
              <div className="text-left">
                <div className="font-medium">{config.label}</div>
                <div className="text-sm opacity-70">{config.description}</div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}