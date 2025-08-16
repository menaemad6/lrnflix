import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gift, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TeacherQuickActions() {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="gradient-text">Quick Actions</CardTitle>
        <CardDescription>Common teaching tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/teacher/create-course">
          <Button className="w-full btn-secondary justify-start group hover-glow">
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Create New Course
          </Button>
        </Link>
        <Link to="/teacher/groups">
          <Button className="w-full btn-secondary justify-start group hover-glow">
            <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Manage Groups
          </Button>
        </Link>
        <Link to="/teacher/codes">
          <Button className="w-full btn-secondary justify-start group hover-glow">
            <Gift className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
            Generate Wallet Codes
          </Button>
        </Link>
        <Link to="/teacher/analytics">
          <Button className="w-full btn-secondary justify-start group hover-glow">
            <BarChart3 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            View Analytics
          </Button>
        </Link>
        <Button className="w-full btn-secondary justify-start group hover-glow">
          <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          AI Course Builder
          <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            Soon
          </Badge>
        </Button>
      </CardContent>
    </Card>
  );
}
