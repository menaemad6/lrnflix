import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, BookOpen, DollarSign, Target } from 'lucide-react';
import { AdminAnalytics as AdminAnalyticsType } from '@/lib/adminQueries';

interface AdminAnalyticsProps {
  analytics: Partial<AdminAnalyticsType>;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ analytics }) => {
  const {
    revenueData = [],
    enrollmentData = [],
    topCourses = [],
    topInstructors = []
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(value) => `Date: ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Daily Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Enrollments']}
                  labelFormatter={(value) => `Date: ${value}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Top Performing Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No course data available</p>
            ) : (
              <div className="space-y-4">
                {topCourses.slice(0, 5).map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm truncate max-w-[200px]">{course.title}</p>
                        <p className="text-xs text-muted-foreground">by {course.instructor_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {course.enrollments} students
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">${course.revenue.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Instructors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Top Performing Instructors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topInstructors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No instructor data available</p>
            ) : (
              <div className="space-y-4">
                {topInstructors.slice(0, 5).map((instructor, index) => (
                  <div key={instructor.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{instructor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {instructor.courses} courses • {instructor.students} students
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">${instructor.revenue.toFixed(0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-muted-foreground">Revenue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};