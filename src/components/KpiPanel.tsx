import React from 'react';
import { Zap, Droplets, Leaf, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { usePlannerStore } from '../store/planner-store';
import { formatNumber, formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export function KpiPanel() {
  const { currentLayout } = usePlannerStore();
  
  if (!currentLayout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Select a preset to see KPIs</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = currentLayout;

  const metrics = [
    {
      icon: Zap,
      label: 'Energy Production',
      value: `${formatNumber(kpis.kWhPerYear || 0, 0)} kWh/yr`,
      color: 'text-solar-600',
    },
    {
      icon: Droplets,
      label: 'Water Retention',
      value: `${formatNumber(kpis.waterRetentionM3 || 0)} m³`,
      color: 'text-water-600',
    },
    {
      icon: Leaf,
      label: 'CO₂ Impact',
      value: `${formatNumber(kpis.co2DeltaTonsYr || 0)} tons/yr`,
      color: 'text-green-600',
    },
    {
      icon: DollarSign,
      label: 'Investment',
      value: formatCurrency(kpis.capexDkk || 0),
      color: 'text-gray-600',
    },
    {
      icon: Clock,
      label: 'Payback Period',
      value: `${formatNumber(kpis.paybackYears || 0)} years`,
      color: 'text-gray-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="flex items-center space-x-3">
              <Icon className={`w-5 h-5 ${metric.color}`} />
              <div className="flex-1">
                <div className="text-sm text-gray-600">{metric.label}</div>
                <div className="font-semibold">{metric.value}</div>
              </div>
            </div>
          );
        })}
        
        {kpis.feasibilityFlags.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-800">Warnings</div>
                {kpis.feasibilityFlags.map((flag, index) => (
                  <div key={index} className="text-xs text-yellow-700 mt-1">
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}