import React from 'react';
import { TeacherColorEditor } from '@/components/teacher/TeacherColorEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Sparkles, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SEOHead } from '@/components/seo';

export const TeacherColorSettings: React.FC = () => {
  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Brand Colors
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Customize your brand colors to create a unique learning experience for your students. 
              Change one color and watch everything update automatically!
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Smart Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Secondary and accent colors are automatically calculated from your primary color 
                  using advanced color theory algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-secondary" />
                  Real-time Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See your color changes instantly across the entire application. 
                  Preview mode lets you test before saving.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5 text-accent" />
                  Full Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your colors automatically apply to all components, buttons, 
                  gradients, and UI elements throughout the platform.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Color Editor */}
          <TeacherColorEditor />

          {/* Additional Info */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Color Generation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Primary:</strong> Your main brand color</li>
                    <li>• <strong>Secondary:</strong> 30° hue shift (analogous)</li>
                    <li>• <strong>Accent:</strong> 120° hue shift (triadic)</li>
                    <li>• <strong>Neutrals:</strong> Same hue, low saturation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Choose a primary color that represents your brand</li>
                    <li>• Let the system calculate secondary/accent automatically</li>
                    <li>• Use preview mode to test before saving</li>
                    <li>• Consider accessibility and contrast ratios</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};
