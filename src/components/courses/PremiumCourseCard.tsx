import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, BookOpen, CheckCircle, Sparkles, Calendar, CreditCard } from 'lucide-react';

interface PremiumCourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  instructor_name: string;
  enrollment_count: number;
  is_enrolled: boolean;
  enrollment_code: string;
  cover_image_url?: string;
  created_at?: string;
  price?: number;
  progress?: number;
  isHovering?: boolean;
  onPreview?: () => void;
  onEnroll?: () => void;
  onContinue?: () => void;
  avatar_url?: string; // NEW
}

export const PremiumCourseCard: React.FC<PremiumCourseCardProps> = ({
  title,
  description,
  category,
  status,
  instructor_name,
  enrollment_count,
  is_enrolled,
  enrollment_code,
  cover_image_url,
  created_at,
  price,
  progress,
  isHovering = true,
  onPreview,
  onEnroll,
  onContinue,
  avatar_url, // NEW
}) => {
  return (
    <Card className={`relative overflow-hidden bg-transparent border-0 ${isHovering ? 'group cursor-pointer transition-transform hover:scale-[1.025]' : ''} min-w-0 rounded-2xl`}>
      {/* Image Section with Overlay and Title */}
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl">
        {cover_image_url ? (
          <img
            src={cover_image_url}
            alt={title}
            className={`object-cover w-full h-full transition-transform duration-500 ${isHovering ? 'group-hover:scale-105' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-primary/60 dark:text-primary-foreground/60 bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2">
              <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.08" />
              <path d="M7 17l3.5-4.5 2.5 3 3.5-4.5L21 17H3z" fill="currentColor" fillOpacity="0.18" />
              <circle cx="9" cy="10" r="2" fill="currentColor" fillOpacity="0.18" />
            </svg>
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
        {/* Badges at the top of the card */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          {category && (
            <Badge variant="outline" className="bg-background/80 border-primary/30 text-primary px-2 py-1 text-xs">
              {category}
            </Badge>
          )}
         
        </div>
        {is_enrolled && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center px-2 py-1 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enrolled
            </Badge>
          </div>
        )}
        {/* Title and Badges Overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-8 z-10 flex flex-col gap-2 pointer-events-none">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-lg flex items-center gap-2">
            {title}
          </h2>
        </div>
      </div>
      {/* Glassmorphic Details Panel */}
      <div className="relative -mt-2 z-20 px-4">
        <div className="rounded-2xl bg-card/80 dark:bg-card/70 backdrop-blur-md p-5 -mt-2 border border-border/60">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Modern Instructor Row */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {avatar_url ? (
                  <img
                    src={avatar_url}
                    alt={instructor_name}
                    className="h-8 w-8 rounded-full object-cover border border-primary/30 shadow"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base font-bold text-primary-foreground border border-primary/30 shadow">
                    {instructor_name?.charAt(0) || '?'}
                  </div>
                )}
                <span className="text-foreground font-semibold">{instructor_name}</span>
              </div>
            </div>
            {/* Date and Price Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
              {created_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-mono">{new Date(created_at).toLocaleDateString()}</span>
                </div>
              )}
              {!is_enrolled && price !== undefined && (
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-card/70 dark:bg-card/60 backdrop-blur-md border border-primary/20">
                    <CreditCard className="h-5 w-5 text-primary/80" />
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {price}
                    </span>
                    <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide">credits</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-3 mt-1">
              {description}
            </p>
            
            {/* Progress Section */}
            {progress !== undefined && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              {is_enrolled ? (
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold min-w-0"
                  onClick={onContinue}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              ) : (
                <>
                  {onPreview && (
                    <Button 
                      variant="outline" 
                      className="flex-1 border-primary/40 text-primary hover:bg-primary/10 min-w-0"
                      onClick={onPreview}
                    >
                      Preview
                    </Button>
                  )}
                  {onEnroll && (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold min-w-0"
                      onClick={onEnroll}
                    >
                      Enroll Now
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}; 