import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Shield, 
  Zap, 
  Crown 
} from 'lucide-react';

export const AdminQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Invoice Management',
      description: 'Manage all platform invoices',
      icon: FileText,
      href: '/admin/invoices',
      color: 'blue'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      color: 'green'
    },
    {
      title: 'Content Management',
      description: 'Manage courses and content',
      icon: BookOpen,
      href: '/admin/content',
      color: 'purple'
    },
    {
      title: 'System Settings',
      description: 'Platform configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30 hover:from-green-500/30 hover:to-green-600/30',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30',
      gray: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 hover:from-gray-500/30 hover:to-gray-600/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      gray: 'text-gray-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start p-4 h-auto bg-gradient-to-r border transition-all duration-300 ${getColorClasses(action.color)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <action.icon className={`h-5 w-5 ${getIconColor(action.color)}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Admin Tools */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-600">Admin Tools</div>
              <div className="text-xs text-muted-foreground">Advanced system management</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="justify-start border-amber-200 hover:bg-amber-50 text-amber-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Analytics
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="justify-start border-amber-200 hover:bg-amber-50 text-amber-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security Logs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};