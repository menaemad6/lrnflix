import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, BookOpen, CreditCard, UserPlus, Clock } from 'lucide-react';
import { AdminActivity } from '@/lib/adminQueries';
import { formatDistanceToNow } from 'date-fns';

interface AdminRecentActivityProps {
  activities: AdminActivity[];
}

export const AdminRecentActivity: React.FC<AdminRecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return UserPlus;
      case 'course_creation':
        return BookOpen;
      case 'enrollment':
        return User;
      case 'payment':
      case 'invoice_paid':
        return CreditCard;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-green-100 text-green-700';
      case 'course_creation':
        return 'bg-blue-100 text-blue-700';
      case 'enrollment':
        return 'bg-purple-100 text-purple-700';
      case 'payment':
      case 'invoice_paid':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityDescription = (activity: AdminActivity) => {
    switch (activity.type) {
      case 'enrollment':
        return (
          <>
            <span className="font-medium">{activity.user_name}</span> enrolled in{' '}
            <span className="font-medium">{activity.metadata?.course_name}</span>
            {activity.metadata?.instructor_name && (
              <span className="text-muted-foreground"> by {activity.metadata.instructor_name}</span>
            )}
          </>
        );
      case 'invoice_paid':
        return (
          <>
            <span className="font-medium">{activity.user_name}</span> completed a payment
            {activity.metadata?.amount && (
              <span className="font-medium text-emerald-600"> of ${activity.metadata.amount.toFixed(2)}</span>
            )}
          </>
        );
      default:
        return (
          <>
            <span className="font-medium">{activity.user_name}</span> {activity.description}
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {getActivityDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};