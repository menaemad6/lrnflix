import React from "react";
import { PremiumCourseCard } from "@/components/courses/PremiumCourseCard";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export function ContinueLearningSection({ enrolledCourses, onContinue }) {
  const { t } = useTranslation('dashboard');

  return (
    <Card className="glass-card border-0">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="gradient-text text-lg sm:text-xl font-bold">{t('continueLearning.title')}</div>
            <span className="text-muted-foreground/80 text-xs sm:text-sm">{t('continueLearning.subtitle')}</span>
          </div>
          <Link to="/courses" className="w-full sm:w-auto sm:ml-auto">
            <Button className="btn-secondary w-full sm:w-auto" size="sm">
              <Target className="h-4 w-4 mr-2" />
              {t('continueLearning.exploreMore')}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {enrolledCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {enrolledCourses.slice(0, 2).map((enrollment) => (
                <PremiumCourseCard
                  key={enrollment.id}
                  id={enrollment.course.id}
                  title={enrollment.course.title}
                  description={enrollment.course.description}
                  category={enrollment.course.category}
                  status="Active"
                  instructor_name={enrollment.course.instructor_name || t('continueLearning.courseInstructor')}
                  enrollment_count={enrollment.enrollment_count || 0}
                  is_enrolled={true}
                  enrollment_code={enrollment.course.enrollment_code || ''}
                  cover_image_url={enrollment.course.cover_image_url}
                  created_at={enrollment.course.created_at}
                  price={enrollment.course.price}
                  progress={enrollment.progress}
                  isHovering={true}
                  onPreview={() => {}}
                  onEnroll={() => {}}
                  onContinue={() => onContinue(enrollment.course.id)}
                  avatar_url={enrollment.course.avatar_url}
                />
              ))}
            </div>
            {enrolledCourses.length > 2 && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <Link to="/student/courses">
                  <Button className="btn-primary" size="sm">
                    {t('continueLearning.viewAll')}
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-medium mb-2">{t('continueLearning.noCoursesYet')}</h3>
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">
              {t('continueLearning.startLearningJourney')}
            </p>
            <Link to="/courses">
              <Button className="btn-primary">
                <Target className="h-4 w-4 mr-2" />
                {t('continueLearning.browseCourses')}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 