import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Settings, Save, Database, Mail, Shield, Globe, Bell, Palette, Server, Brain, Loader2 } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { useAiAssistantSettings } from '@/hooks/useAiAssistantSettings';

export const AdminSettingsPage = () => {
  const { teacher } = useTenant();
  const { toast } = useToast();
  
  // AI Assistant settings
  const {
    values: aiValues,
    form: aiForm,
    loading: aiLoading,
    saving: aiSaving,
    error: aiError,
    success: aiSuccess
  } = useAiAssistantSettings();
  
  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Learnify',
    platformDescription: 'A comprehensive learning management system',
    supportEmail: 'support@learnify.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    
    // Feature Flags
    enableRegistration: true,
    enableEmailVerification: true,
    enableTwoFactor: false,
    enableMaintenanceMode: false,
    enableAnalytics: true,
    enableNotifications: true,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@learnify.com',
    
    // Security Settings
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    
    // Storage Settings
    maxFileSize: 10,
    allowedFileTypes: 'jpg,jpeg,png,pdf,doc,docx,mp4,mp3',
    storageProvider: 'local',
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully.",
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-6">
          <TeacherPageHeader
            title={teacher ? `Settings - ${teacher.display_name}` : "System Settings"}
            subtitle={teacher ? `Configure settings for ${teacher.display_name}` : "Configure platform-wide settings and preferences"}
            actionLabel="Save Changes"
            onAction={handleSave}
            actionIcon={<Save className="h-4 w-4 mr-2" />}
            actionButtonProps={{ className: 'btn-primary' }}
          />

          {/* Admin Badge */}
          {!teacher && (
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Global Admin View
              </Badge>
            </div>
          )}

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select value={settings.defaultLanguage} onValueChange={(value) => handleSettingChange('defaultLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Assistant Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={aiForm.handleSubmit}
                className="space-y-6"
                autoComplete="off"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="daily_minutes_limit">Daily Free Minutes Limit</Label>
                    <Input
                      id="daily_minutes_limit"
                      name="daily_minutes_limit"
                      type="number"
                      min={0}
                      placeholder="E.g. 5"
                      value={aiForm.values.daily_minutes_limit ?? ""}
                      onChange={aiForm.handleChange}
                      disabled={aiSaving}
                    />
                    <p className="text-sm text-muted-foreground">
                      The maximum free AI assistant minutes given to students each day.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minutes_price">Minute Price (Credits / min)</Label>
                    <Input
                      id="minutes_price"
                      name="minutes_price"
                      type="number"
                      min={0}
                      placeholder="E.g. 1"
                      value={aiForm.values.minutes_price ?? ""}
                      onChange={aiForm.handleChange}
                      disabled={aiSaving}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of wallet credits required to purchase 1 AI minute.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="daily_messages_limit">Daily Messages Limit</Label>
                  <Input
                    id="daily_messages_limit"
                    name="daily_messages_limit"
                    type="number"
                    min={1}
                    placeholder="E.g. 10"
                    value={aiForm.values.daily_messages_limit ?? ""}
                    onChange={aiForm.handleChange}
                    disabled={aiSaving}
                  />
                  <p className="text-sm text-muted-foreground">
                    The maximum number of AI chat messages students can send per day.
                  </p>
                </div>
                
                {aiError && (
                  <div className="text-sm text-red-500">
                    {aiError}
                  </div>
                )}
                {aiSuccess && (
                  <div className="text-sm text-green-600">
                    AI Assistant settings saved!
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={aiSaving || aiLoading}
                >
                  {aiSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving AI Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save AI Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRegistration">Enable User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    id="enableRegistration"
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => handleSettingChange('enableRegistration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableEmailVerification">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification</p>
                  </div>
                  <Switch
                    id="enableEmailVerification"
                    checked={settings.enableEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('enableEmailVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for all users</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableMaintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                  </div>
                  <Switch
                    id="enableMaintenanceMode"
                    checked={settings.enableMaintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('enableMaintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAnalytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable analytics tracking</p>
                  </div>
                  <Switch
                    id="enableAnalytics"
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable system notifications</p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">Enforce complex password requirements</p>
                  </div>
                  <Switch
                    id="requireStrongPasswords"
                    checked={settings.requireStrongPasswords}
                    onCheckedChange={(checked) => handleSettingChange('requireStrongPasswords', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select value={settings.storageProvider} onValueChange={(value) => handleSettingChange('storageProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="aws">AWS S3</SelectItem>
                      <SelectItem value="cloudinary">Cloudinary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                  placeholder="jpg,jpeg,png,pdf,doc,docx,mp4,mp3"
                />
                <p className="text-sm text-muted-foreground">Comma-separated list of allowed file extensions</p>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};
