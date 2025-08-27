import React from 'react';
import { Button } from '@/components/ui/button';

interface TeacherPageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionButtonProps?: React.ComponentProps<typeof Button>;
}

export const TeacherPageHeader: React.FC<TeacherPageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  actionButtonProps,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div className="flex-1 min-w-0">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary break-words">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base break-words">{subtitle}</p>
    </div>
    {actionLabel && (
      <div className="flex-shrink-0">
        <Button onClick={onAction} {...actionButtonProps} className="w-full sm:w-auto text-sm sm:text-base">
          {actionIcon}
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export default TeacherPageHeader; 