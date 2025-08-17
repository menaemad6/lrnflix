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
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h2>
      <p className="text-muted-foreground mt-1">{subtitle}</p>
    </div>
    {actionLabel && (
    <Button onClick={onAction} {...actionButtonProps}>
      {actionIcon}
      {actionLabel}
    </Button>
    )}
  </div>
);

export default TeacherPageHeader; 