import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  HardDrive, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Activity
} from 'lucide-react';
import { AdminSystemOverview as SystemOverviewType } from '@/lib/adminQueries';

interface AdminSystemOverviewProps {
  overview: Partial<SystemOverviewType>;
}

export const AdminSystemOverview: React.FC<AdminSystemOverviewProps> = ({ overview }) => {
  const {
    systemHealth = { database: 'healthy', storage: 'healthy', api: 'healthy' },
    storageUsed = 0,
    storageLimit = 10,
    activeConnections = 0,
    errorRate = 0,
    avgResponseTime = 0
  } = overview;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
      case 'error':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const storagePercent = (storageUsed / storageLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Health */}
        <div>
          <h4 className="text-sm font-semibold mb-3">System Health</h4>
          <div className="space-y-3">
            {Object.entries(systemHealth).map(([service, status]) => {
              const IconComponent = getHealthIcon(status);
              const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
              
              return (
                <div key={service} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${getHealthColor(status)}`} />
                    <span className="text-sm font-medium">{serviceName}</span>
                  </div>
                  <Badge variant={getHealthBadgeVariant(status)} className="text-xs capitalize">
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Usage
            </h4>
            <span className="text-xs text-muted-foreground">
              {storageUsed.toFixed(1)} / {storageLimit} GB
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {(100 - storagePercent).toFixed(1)}% available
          </p>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Active Connections */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Connections</span>
              </div>
              <p className="text-lg font-bold">{activeConnections}</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>

            {/* Error Rate */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium">Error Rate</span>
              </div>
              <p className="text-lg font-bold">{(errorRate * 100).toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </div>

            {/* Response Time */}
            <div className="p-3 bg-muted/30 rounded-lg col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium">Avg Response Time</span>
              </div>
              <p className="text-lg font-bold">{avgResponseTime}ms</p>
              <p className="text-xs text-muted-foreground">Server response time</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-green-700">System Operational</div>
              <div className="text-xs text-muted-foreground">All systems running normally</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};