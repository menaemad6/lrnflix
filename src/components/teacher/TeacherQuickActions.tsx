import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gift, BarChart3, Zap, BookOpen, MessageSquare, Calendar, Target, Rocket, Brain, Palette, Video, FileText, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TeacherQuickActions() {
  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="gradient-text text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Accelerate your teaching workflow</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-3">
          <Link to="/teacher/create-course">
            <Button className="w-full btn-primary justify-start group hover-glow h-12">
              <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Create New Course</span>
              <Badge className="ml-auto bg-white/20 text-white text-xs px-2 py-1">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </Button>
          </Link>
          
          <Link to="/teacher/lessons">
            <Button className="w-full btn-secondary justify-start group hover-glow h-12">
              <BookOpen className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">Manage Lessons</span>
              <Badge className="ml-auto bg-primary-500/20 text-primary-400 text-xs px-2 py-1">
                <Target className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </Button>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/teacher/groups">
            <Button className="w-full btn-secondary justify-start group hover-glow h-10 text-sm">
              <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Groups
            </Button>
          </Link>
          
          <Link to="/teacher/discussions">
            <Button className="w-full btn-secondary justify-start group hover-glow h-10 text-sm">
              <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Discussions
            </Button>
          </Link>
          
          <Link to="/teacher/analytics">
            <Button className="w-full btn-secondary justify-start group hover-glow h-10 text-sm">
              <BarChart3 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Analytics
            </Button>
          </Link>
          
          <Link to="/teacher/schedule">
            <Button className="w-full btn-secondary justify-start group hover-glow h-10 text-sm">
              <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Schedule
            </Button>
          </Link>
        </div>

        {/* Tertiary Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link to="/teacher/codes">
            <Button variant="outline" className="w-full justify-start group hover-glow h-9 text-xs">
              <Gift className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
              Codes
            </Button>
          </Link>
          
          <Link to="/teacher/quizzes">
            <Button variant="outline" className="w-full justify-start group hover-glow h-9 text-xs">
              <Target className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform duration-300" />
              Quizzes
            </Button>
          </Link>
          
          <Link to="/teacher/settings">
            <Button variant="outline" className="w-full justify-start group hover-glow h-9 text-xs">
              <Settings className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
              Settings
            </Button>
          </Link>
        </div>

        {/* AI Features */}
        <div className="pt-2 border-t border-primary/20">
          <Button className="w-full btn-secondary justify-start group hover-glow h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30">
            <Brain className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">AI Course Builder</span>
            <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5">
              <Zap className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
