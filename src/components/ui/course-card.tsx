import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseCardProps {
  id: number | string;
  title: string;
  description: string;
  image: string;
  duration?: string;
  students?: number;
  rating?: number;
  lessons?: number;
  level?: string;
  year?: string;
  price?: string;
  category?: string;
  instructor?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  image,
  duration,
  students,
  rating,
  lessons,
  level,
  year,
  price,
  category,
  instructor,
  className,
  onClick,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={cn(
        "glass-card border-0 hover-glow h-full overflow-hidden",
        isFeatured && "ring-2 ring-primary/20",
        isCompact && "h-auto"
      )}>
        {/* Course Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className={cn(
              "w-full object-cover group-hover:scale-110 transition-transform duration-700",
              isCompact ? "h-32" : "h-48"
            )}
            whileHover={{ scale: 1.05 }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play button */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </motion.div>

          {/* Category badge */}
          {category && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              {category}
            </div>
          )}

          {/* Level badge */}
          {level && (
            <div className="absolute top-4 left-4 px-3 py-1 glass backdrop-blur-sm rounded-full text-xs font-medium">
              {level}
            </div>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-secondary backdrop-blur-sm rounded-full text-xs font-medium text-white">
              مميز
            </div>
          )}
        </div>

        <CardContent className={cn("p-6", isCompact && "p-4")}>
          {/* Course info */}
          <div className="space-y-4">
            <div>
              <h3 className={cn(
                "font-bold group-hover:text-primary transition-colors leading-tight",
                isCompact ? "text-lg" : "text-xl"
              )}>
                {title}
              </h3>
              {year && (
                <p className="text-sm text-primary/80 mt-1">{year}</p>
              )}
              {instructor && (
                <p className="text-sm text-muted-foreground mt-1">بواسطة {instructor}</p>
              )}
            </div>
            
            <p className={cn(
              "text-muted-foreground leading-relaxed line-clamp-2",
              isCompact ? "text-sm" : "text-sm"
            )}>
              {description}
            </p>

            {/* Stats */}
            {(duration || lessons || students || rating) && (
              <div className={cn(
                "grid gap-4 py-3 border-y border-white/10",
                isCompact ? "grid-cols-2" : "grid-cols-2"
              )}>
                {duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{duration}</span>
                  </div>
                )}
                {lessons && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{lessons} درس</span>
                  </div>
                )}
                {students && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{students} طالب</span>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-muted-foreground">{rating}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {price && (
                  <span className={cn(
                    "font-bold text-primary",
                    isCompact ? "text-lg" : "text-2xl"
                  )}>
                    {price}
                  </span>
                )}
              </div>
              <Button
                size={isCompact ? "sm" : "sm"}
                className="btn-primary group-hover:scale-105 transition-transform flex items-center gap-2"
              >
                ابدأ الآن
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
