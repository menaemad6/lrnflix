import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Palette, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { RootState } from '@/store/store';
import { getAllColors } from '@/data/constants';
import { updateTenantColors } from '@/utils/cssVariableInjector';

interface TeacherColors {
  primary: string;
  secondary?: string | null;
  accent?: string | null;
}

export const TeacherColorEditor: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [colors, setColors] = useState<TeacherColors>({
    primary: '#10b981',
    secondary: null,
    accent: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [originalColors, setOriginalColors] = useState<TeacherColors | null>(null);

  // Get all calculated colors for preview
  const allColors = getAllColors();

  useEffect(() => {
    if (user) {
      fetchTeacherColors();
    }
  }, [user]);

  const fetchTeacherColors = async () => {
    try {
      setLoading(true);
      const { data: teacherData, error } = await supabase
        .from('teachers')
        .select('colors')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching teacher colors:', error);
        return;
      }

      if (teacherData?.colors) {
        const teacherColors = teacherData.colors as TeacherColors;
        setColors(teacherColors);
        setOriginalColors(teacherColors);
      }
    } catch (error) {
      console.error('Error fetching teacher colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field: keyof TeacherColors, value: string) => {
    setColors(prev => ({
      ...prev,
      [field]: value,
    }));

    // If in preview mode, update CSS variables immediately
    if (previewMode) {
      updateTenantColors({
        primary: field === 'primary' ? value : colors.primary,
        secondary: field === 'secondary' ? value : colors.secondary,
        accent: field === 'accent' ? value : colors.accent,
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('teachers')
        .update({ colors })
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to save colors');
        return;
      }

      // Update CSS variables with new colors
      updateTenantColors(colors);
      
      // Update original colors
      setOriginalColors(colors);
      
      toast.success('Colors saved successfully!');
    } catch (error) {
      console.error('Error saving colors:', error);
      toast.error('Failed to save colors');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalColors) {
      setColors(originalColors);
      updateTenantColors(originalColors);
      toast.success('Colors reset to saved values');
    }
  };

  const handlePreviewToggle = () => {
    if (previewMode) {
      // Exit preview mode - restore original colors
      if (originalColors) {
        updateTenantColors(originalColors);
      }
      setPreviewMode(false);
    } else {
      // Enter preview mode - apply current colors
      updateTenantColors(colors);
      setPreviewMode(true);
    }
  };

  const handleResetToDefault = () => {
    const defaultColors = {
      primary: '#10b981',
      secondary: null,
      accent: null,
    };
    setColors(defaultColors);
    updateTenantColors(defaultColors);
    toast.success('Colors reset to defaults');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Customize Your Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div className="space-y-3">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This is your main brand color. All other colors will be calculated from this.
              </p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-3">
              <Label htmlFor="secondary-color">Secondary Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={colors.secondary || '#14b8a6'}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={colors.secondary || ''}
                  onChange={(e) => handleColorChange('secondary', e.target.value || null)}
                  placeholder="Leave empty for auto-calculation"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to automatically calculate from primary color.
              </p>
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <Label htmlFor="accent-color">Accent Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={colors.accent || '#06b6d4'}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={colors.accent || ''}
                  onChange={(e) => handleColorChange('accent', e.target.value || null)}
                  placeholder="Leave empty for auto-calculation"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to automatically calculate from primary color.
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Colors'}
            </Button>

            <Button
              variant="outline"
              onClick={handlePreviewToggle}
              className={previewMode ? 'bg-orange-50 border-orange-200' : ''}
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Exit Preview' : 'Preview Changes'}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!originalColors}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Saved
            </Button>

            <Button
              variant="outline"
              onClick={handleResetToDefault}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          {previewMode && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Preview Mode:</strong> You're seeing your color changes in real-time. 
                Click "Save Colors" to make them permanent, or "Exit Preview" to revert.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Color Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Primary Scale</h4>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-8 h-8 rounded border mx-auto mb-1"
                      style={{ backgroundColor: allColors[`primary-${shade}` as keyof typeof allColors] as string }}
                    />
                    <p className="text-xs">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Neutral Scale</h4>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-8 h-8 rounded border mx-auto mb-1"
                      style={{ backgroundColor: allColors[shade.toString() as keyof typeof allColors] as string }}
                    />
                    <p className="text-xs">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Semantic Colors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                    style={{ backgroundColor: allColors['success' as keyof typeof allColors] as string }}
                  />
                  <p className="text-sm font-medium">Success</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                    style={{ backgroundColor: allColors['warning' as keyof typeof allColors] as string }}
                  />
                  <p className="text-sm font-medium">Warning</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                    style={{ backgroundColor: allColors['error' as keyof typeof allColors] as string }}
                  />
                  <p className="text-sm font-medium">Error</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                    style={{ backgroundColor: allColors['info' as keyof typeof allColors] as string }}
                  />
                  <p className="text-sm font-medium">Info</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent">
            <h4 className="font-semibold text-white">Live Preview</h4>
            <p className="text-sm text-white opacity-90">
              This gradient uses your custom colors. See how they work together!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
