
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateCourseModal } from '@/components/courses/CreateCourseModal';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useTeacherCourses } from '@/lib/queries';
// Remove direct import of PremiumCourseCard and CourseCardSkeleton
// import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
// Add lazy imports:
const PremiumCourseCard = React.lazy(() => import('@/components/courses/PremiumCourseCard').then(m => ({ default: m.PremiumCourseCard })));
const CourseCardSkeleton = React.lazy(() => import('@/components/student/skeletons/CourseCardSkeleton').then(m => ({ default: m.CourseCardSkeleton })));

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  enrollments?: { count: number }[];
  category?: string;
  cover_image_url?: string;
}

export const TeacherCoursesPage = () => {
  const { data: courses = [], isLoading, refetch } = useTeacherCourses();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  // Dynamically get unique categories from courses
  const courseCategories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  const categories = ['All', ...courseCategories];

  const handleCourseCreated = () => {
    refetch();
  };

  // Filter logic for search and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TeacherPageHeader
          title="Course Management"
          subtitle="Create and manage your educational content"
          actionLabel="New Course"
          onAction={() => setIsCreateModalOpen(true)}
          actionIcon={<Plus className="h-4 w-4 mr-2" />}
          actionButtonProps={{ className: 'btn-primary' }}
        />
        {/* Search and Filters as a row with dropdown */}
        <Card className="glass-card w-full max-w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-row gap-4 w-full items-center">
              {/* Search input */}
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by course name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
              </div>
              {/* Dropdown for categories */}
              <div className={`${searchFocused ? 'hidden sm:block' : ''}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 min-w-[140px] justify-between"
                    >
                      <span>{selectedCategory}</span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onSelect={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? 'bg-primary-500 text-white font-semibold'
                            : ''
                        }
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Suspense fallback={<div className='glass-card border-0 p-6'><div className='h-40 w-full rounded-xl mb-2 bg-muted animate-pulse' /></div>} key={i}>
                <CourseCardSkeleton />
              </Suspense>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Create Your First Course</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Share your expertise with students worldwide. Build engaging courses with our AI-powered tools.
              </p>
              <Button 
                className="btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Suspense fallback={<CourseCardSkeleton />} key={course.id}>
                <PremiumCourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  category={course.category || ''}
                  status={course.status}
                  instructor_name={"You"}
                  enrollment_count={course.enrollments?.[0]?.count || 0}
                  is_enrolled={true}
                  enrollment_code={''}
                  cover_image_url={course.cover_image_url}
                  created_at={course.created_at}
                  price={course.price}
                  progress={undefined}
                  onContinue={() => navigate(`/teacher/courses/${course.id}`)}
                  continueButtonLabel="Manage Course"
                />
              </Suspense>
            ))}
          </div>
        )}
      </div>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </DashboardLayout>
  );
};
