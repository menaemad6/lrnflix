import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Users, Star, Sparkles } from 'lucide-react';

/**
 * Props for ChapterCard
 * @property id - Chapter ID
 * @property title - Chapter title
 * @property description - Chapter description
 * @property price - Chapter price in credits
 * @property courseCount - Number of courses in the chapter
 * @property isEnrolled - Whether the user is enrolled in this chapter
 * @property coverImageUrl - Optional cover image URL
 * @property onPreview - Preview button handler
 * @property onEnroll - Enroll button handler
 * @property onContinue - Continue button handler (if enrolled)
 */
export interface ChapterCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  courseCount: number;
  isEnrolled: boolean;
  coverImageUrl?: string;
  onPreview?: () => void;
  onEnroll?: () => void;
  onContinue?: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  description,
  price,
  courseCount,
  isEnrolled,
  coverImageUrl,
  onPreview,
  onEnroll,
  onContinue,
}) => {
  return (
    <Card className="relative overflow-hidden border-0 rounded-3xl shadow-xl bg-background/80 group min-w-0 flex flex-col h-full">
      {/* Unique vertical accent bar */}
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-primary to-secondary rounded-l-3xl" />
      {/* Image or Icon */}
      <div className="relative w-full aspect-[16/7] overflow-hidden rounded-t-3xl flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-primary/60" />
        )}
        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white flex items-center px-3 py-1 text-sm rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4 mr-1" />
              Enrolled
            </Badge>
          </div>
        )}
      </div>
      {/* Details Panel */}
      <CardContent className="flex-1 flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-extrabold leading-tight flex-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Users className="h-4 w-4" />
          <span>{courseCount} Courses</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-card/70 border border-primary/20 text-primary font-bold text-lg shadow-sm">
            <Star className="h-5 w-5 text-primary/80" />
            {price} <span className="text-xs font-semibold uppercase tracking-wide">credits</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
          {isEnrolled ? (
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold min-w-0" onClick={onContinue}>
              <BookOpen className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : (
            <>
              {onPreview && (
                <Button variant="outline" className="flex-1 border-primary/40 text-primary hover:bg-primary/10 min-w-0" onClick={onPreview}>
                  Preview
                </Button>
              )}
              <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold min-w-0" onClick={onEnroll}>
                <Sparkles className="h-4 w-4 mr-2" />
                Unlock Chapter
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterCard; 