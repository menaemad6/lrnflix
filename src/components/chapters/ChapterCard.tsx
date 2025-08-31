import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Star, Sparkles, CreditCard } from 'lucide-react';

/**
 * Props for ChapterCard
 * @property id - Chapter ID
 * @property title - Chapter title
 * @property description - Chapter description
 * @property price - Chapter price in credits
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
  isEnrolled: boolean;
  coverImageUrl?: string;
  instructorName?: string;
  instructorAvatar?: string;
  onPreview?: () => void;
  onEnroll?: () => void;
  onContinue?: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  description,
  price,
  isEnrolled,
  coverImageUrl,
  instructorName,
  instructorAvatar,
  onPreview,
  onEnroll,
  onContinue,
}) => {
  return (
    <Card className="relative overflow-hidden border-0 rounded-3xl shadow-xl bg-background/80 group min-w-0">
      {/* Unique vertical accent bar */}
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-primary to-secondary rounded-l-3xl" />
      {/* Image or Icon */}
      <div className="relative w-full aspect-[16/7] overflow-hidden rounded-t-3xl flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-primary/60" />
          </div>
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
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-extrabold leading-tight flex-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          
          {/* Price positioned on the right */}
          {!isEnrolled && (
            <div className="flex items-center justify-center flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-card/70 dark:bg-card/60 backdrop-blur-md border border-primary/20">
                <CreditCard className="h-5 w-5 text-primary/80" />
                <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {price}
                </span>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide">EGP</span>
              </span>
            </div>
          )}
        </div>
        
        {/* Instructor Row */}
        {instructorName && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            {instructorAvatar ? (
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="h-8 w-8 rounded-full object-cover border border-primary/30 shadow"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base font-bold text-primary-foreground border border-primary/30 shadow">
                {instructorName.charAt(0) || '?'}
              </div>
            )}
            <span className="text-foreground font-semibold">{instructorName}</span>
          </div>
        )}
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {isEnrolled ? (
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold min-w-0" onClick={onContinue}>
              <Sparkles className="h-4 w-4 mr-2" />
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