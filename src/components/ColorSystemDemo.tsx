import React, { useEffect, useState } from 'react';
import { getAllCssVariables } from '@/utils/cssVariableInjector';

export const ColorSystemDemo: React.FC = () => {
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateVariables = () => {
      const variables = getAllCssVariables();
      setCssVariables(variables);
    };

    updateVariables();
    
    // Refresh every second to see real-time updates
    const interval = setInterval(updateVariables, 1000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">CSS Variables Debug</h2>
        <button 
          onClick={refresh}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2 text-primary">Key Variables</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">--primary:</span>
              <span className="font-mono">{cssVariables['--primary'] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">--ring:</span>
              <span className="font-mono">{cssVariables['--ring'] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">--border:</span>
              <span className="font-mono">{cssVariables['--border'] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">--input:</span>
              <span className="font-mono">{cssVariables['--input'] || 'Not set'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 text-secondary">Theme Variables</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">--background:</span>
              <span className="font-mono">{cssVariables['--background'] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">--foreground:</span>
              <span className="font-mono">{cssVariables['--foreground'] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">--card:</span>
              <span className="font-mono">{cssVariables['--card'] || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2 text-accent">Test Input</h3>
        <input 
          type="text" 
          placeholder="Focus this input to see ring color..."
          className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          The ring color should match your tenant's primary color (not emerald green)
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">All Variables</h3>
        <div className="max-h-40 overflow-y-auto">
          {Object.entries(cssVariables).map(([key, value]) => (
            <div key={key} className="text-xs font-mono">
              {key}: {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
