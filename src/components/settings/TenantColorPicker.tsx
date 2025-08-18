import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateCssVariables } from '@/data/constants';
import { useTenant } from '@/contexts/TenantContext';

interface ColorPreviewProps {
  color: string;
  label: string;
  className?: string;
}

const ColorPreview: React.FC<ColorPreviewProps> = ({ color, label, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div 
      className="w-8 h-8 rounded border border-border"
      style={{ backgroundColor: color }}
    />
    <div className="flex flex-col">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{color}</span>
    </div>
  </div>
);

export const TenantColorPicker: React.FC = () => {
  const { colors } = useTenant();
  const [primaryColor, setPrimaryColor] = useState(colors?.primary || '#10b981');
  const [secondaryColor, setSecondaryColor] = useState(colors?.secondary || '#14b8a6');
  const [accentColor, setAccentColor] = useState(colors?.accent || '#06b6d4');

  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', value: string) => {
    switch (type) {
      case 'primary':
        setPrimaryColor(value);
        break;
      case 'secondary':
        setSecondaryColor(value);
        break;
      case 'accent':
        setAccentColor(value);
        break;
    }

    // Apply colors immediately to see changes
    const newColors = {
      primary: type === 'primary' ? value : primaryColor,
      secondary: type === 'secondary' ? value : secondaryColor,
      accent: type === 'accent' ? value : accentColor,
    };

    const cssVars = generateCssVariables(newColors);
    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  };

  const resetToDefaults = () => {
    const defaultColors = {
      primary: '#10b981',
      secondary: '#14b8a6',
      accent: '#06b6d4',
    };

    setPrimaryColor(defaultColors.primary);
    setSecondaryColor(defaultColors.secondary);
    setAccentColor(defaultColors.accent);

    const cssVars = generateCssVariables(defaultColors);
    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  };

  const cssVars = generateCssVariables({
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
  });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Tenant Color Customization</CardTitle>
        <CardDescription>
          Customize your tenant's color scheme. Changes are applied immediately to preview the results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Color Section */}
        <div className="space-y-4">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-20 h-12"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              placeholder="#10b981"
              className="flex-1"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorPreview color={cssVars['--primary']} label="Primary" />
            <ColorPreview color={cssVars['--primary-light']} label="Primary Light" />
            <ColorPreview color={cssVars['--primary-dark']} label="Primary Dark" />
            <ColorPreview color={cssVars['--primary-50']} label="Primary 50" />
          </div>
        </div>

        {/* Secondary Color Section */}
        <div className="space-y-4">
          <Label htmlFor="secondary-color">Secondary Color</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="secondary-color"
              type="color"
              value={secondaryColor}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-20 h-12"
            />
            <Input
              type="text"
              value={secondaryColor}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              placeholder="#14b8a6"
              className="flex-1"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorPreview color={cssVars['--secondary']} label="Secondary" />
            <ColorPreview color={cssVars['--secondary-light']} label="Secondary Light" />
            <ColorPreview color={cssVars['--secondary-dark']} label="Secondary Dark" />
          </div>
        </div>

        {/* Accent Color Section */}
        <div className="space-y-4">
          <Label htmlFor="accent-color">Accent Color</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="accent-color"
              type="color"
              value={accentColor}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-20 h-12"
            />
            <Input
              type="text"
              value={accentColor}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              placeholder="#06b6d4"
              className="flex-1"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorPreview color={cssVars['--accent']} label="Accent" />
            <ColorPreview color={cssVars['--accent-light']} label="Accent Light" />
            <ColorPreview color={cssVars['--accent-dark']} label="Accent Dark" />
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <Label>Color Preview</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button className="w-full" style={{ background: cssVars['--primary'] }}>
                Primary Button
              </Button>
              <Button variant="outline" className="w-full" style={{ borderColor: cssVars['--primary'], color: cssVars['--primary'] }}>
                Primary Outline
              </Button>
            </div>
            <div className="space-y-2">
              <Button className="w-full" style={{ background: cssVars['--secondary'] }}>
                Secondary Button
              </Button>
              <Button variant="outline" className="w-full" style={{ borderColor: cssVars['--secondary'], color: cssVars['--secondary'] }}>
                Secondary Outline
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button>
            Save Colors
          </Button>
        </div>

        {/* CSS Variables Display */}
        <div className="space-y-2">
          <Label>Generated CSS Variables</Label>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-xs overflow-x-auto">
              {Object.entries(cssVars)
                .map(([property, value]) => `${property}: ${value};`)
                .join('\n')}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
