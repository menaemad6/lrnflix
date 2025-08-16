import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Star } from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeDiscussions: number;
}

interface TeacherTeachingProgressProps {
  stats: DashboardStats;
}

export function TeacherTeachingProgress({ stats }: TeacherTeachingProgressProps) {
  return (
    <Card className="glass-card border-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5" />
      <CardHeader className="relative z-10">
        <CardTitle className="gradient-text text-xl flex items-center gap-2">
          <Star className="h-6 w-6" />
          Teaching Progress
        </CardTitle>
        <CardDescription>Your impact as an educator</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <BookOpen className="h-8 w-8 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Course Creator</h3>
            <p className="text-sm text-muted-foreground">
              You've created <span className="text-emerald-400 font-bold">{stats.totalCourses}</span> courses
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Users className="h-8 w-8 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Student Mentor</h3>
            <p className="text-sm text-muted-foreground">
              Teaching <span className="text-blue-400 font-bold">{stats.totalStudents}</span> students
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Star className="h-8 w-8 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Revenue Generator</h3>
            <p className="text-sm text-muted-foreground">
              Earned <span className="text-purple-400 font-bold">{stats.totalRevenue}</span> credits
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
