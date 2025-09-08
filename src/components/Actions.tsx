import React from 'react';
import { Sparkles, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { usePlannerStore } from '../store/planner-store';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export function Actions() {
  const { currentLayout, isOptimizing, optimizeLayout } = usePlannerStore();

  const handleExportPdf = async () => {
    // Placeholder for PDF export functionality
    alert('PDF export functionality will be implemented with jsPDF + html2canvas');
  };

  const handleSuggestLayout = async () => {
    // Placeholder for AI suggestion
    alert('AI layout suggestion will be implemented with Cloud Functions');
  };

  const handleValidateConstraints = async () => {
    // Placeholder for constraint validation
    alert('Constraint validation will be implemented with Cloud Functions');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSuggestLayout}
          disabled={!currentLayout}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Suggest Layout
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={optimizeLayout}
          disabled={!currentLayout || isOptimizing}
        >
          {isOptimizing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isOptimizing ? 'Optimizing...' : 'Optimize Layout'}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleValidateConstraints}
          disabled={!currentLayout}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Validate Constraints
        </Button>

        <Button
          variant="default"
          className="w-full"
          onClick={handleExportPdf}
          disabled={!currentLayout}
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF Report
        </Button>
      </CardContent>
    </Card>
  );
}