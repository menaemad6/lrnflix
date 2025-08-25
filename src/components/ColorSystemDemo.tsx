import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { generateCssVariables } from '@/data/constants';

export const ColorSystemDemo: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [customPrimary, setCustomPrimary] = useState('#10b981');
  const [showDynamicClasses, setShowDynamicClasses] = useState(false);

  const applyCustomColors = () => {
    const cssVars = generateCssVariables({ primary: customPrimary }, theme);
    Object.entries(cssVars).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, value);
      }
    });
  };

  const resetColors = () => {
    const cssVars = generateCssVariables({ primary: '#10b981' }, theme);
    Object.entries(cssVars).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, value);
      }
    });
    setCustomPrimary('#10b981');
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Dynamic Color System Demo</h1>
          <p className="text-lg text-muted-foreground">
            Experience the new dynamic dark theme that uses primary colors instead of pure black
          </p>
        </div>

        {/* Theme Toggle */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Theme Control</CardTitle>
            <CardDescription>
              Switch between light and dark themes to see the dynamic color system in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
              <Label htmlFor="theme-toggle">
                {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Current Theme: </Label>
              <Badge variant={theme === 'dark' ? 'default' : 'secondary'}>
                {theme}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Custom Color Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Custom Primary Color</CardTitle>
            <CardDescription>
              Change the primary color to see how it affects the entire dark theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                className="w-20 h-12"
              />
              <Input
                type="text"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                placeholder="#10b981"
                className="flex-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={applyCustomColors}>Apply Colors</Button>
              <Button variant="outline" onClick={resetColors}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Theme Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
              <CardDescription>
                Dynamic backgrounds that adapt to your primary color
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 rounded-lg bg-background border-2 border-border flex items-center justify-center">
                <span className="text-sm font-medium">Main Background</span>
              </div>
              <div className="h-20 rounded-lg bg-card border-2 border-border flex items-center justify-center">
                <span className="text-sm font-medium">Card Background</span>
              </div>
              <div className="h-20 rounded-lg bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-sm font-medium">Muted Background</span>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Utility Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Utility Classes</CardTitle>
              <CardDescription>
                New utility classes for enhanced dark theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 rounded-lg dynamic-card flex items-center justify-center">
                <span className="text-sm font-medium">Dynamic Card</span>
              </div>
              <div className="h-20 rounded-lg dynamic-card-elevated flex items-center justify-center">
                <span className="text-sm font-medium">Elevated Card</span>
              </div>
              <div className="h-20 rounded-lg primary-tint-card flex items-center justify-center">
                <span className="text-sm font-medium">Primary Tint Card</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Glass Effects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Glass Effects</CardTitle>
            <CardDescription>
              Sophisticated glass effects that work beautifully in dark theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 rounded-lg glass-enhanced flex items-center justify-center">
                <span className="text-sm font-medium">Enhanced Glass</span>
              </div>
              <div className="h-32 rounded-lg glass-card-enhanced flex items-center justify-center">
                <span className="text-sm font-medium">Enhanced Glass Card</span>
              </div>
              <div className="h-32 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium">Gradient Tint</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Border Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dynamic Borders</CardTitle>
            <CardDescription>
              Borders that adapt to your primary color theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-20 rounded-lg bg-card primary-border-subtle flex items-center justify-center">
                <span className="text-sm font-medium">Subtle Border</span>
              </div>
              <div className="h-20 rounded-lg bg-card primary-border-medium flex items-center justify-center">
                <span className="text-sm font-medium">Medium Border</span>
              </div>
              <div className="h-20 rounded-lg bg-card primary-border-strong flex items-center justify-center">
                <span className="text-sm font-medium">Strong Border</span>
              </div>
              <div className="h-20 rounded-lg bg-card dynamic-border-elevated flex items-center justify-center">
                <span className="text-sm font-medium">Elevated Border</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
            <CardDescription>
              See how form elements and buttons adapt to the dynamic theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dynamic Input</Label>
                <Input 
                  placeholder="Type something..." 
                  className="dynamic-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Regular Input</Label>
                <Input placeholder="Type something..." />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Color Values</CardTitle>
            <CardDescription>
              Real-time display of the current CSS custom properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Background Colors</h4>
                <div className="space-y-1">
                  <div>Background: <code className="bg-muted px-1 rounded">hsl(var(--background))</code></div>
                  <div>Card: <code className="bg-muted px-1 rounded">hsl(var(--card))</code></div>
                  <div>Muted: <code className="bg-muted px-1 rounded">hsl(var(--muted))</code></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Border Colors</h4>
                <div className="space-y-1">
                  <div>Border: <code className="bg-muted px-1 rounded">hsl(var(--border))</code></div>
                  <div>Input: <code className="bg-muted px-1 rounded">hsl(var(--input))</code></div>
                  <div>Primary: <code className="bg-muted px-1 rounded">hsl(var(--primary))</code></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
