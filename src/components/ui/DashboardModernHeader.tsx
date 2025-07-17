import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, BookOpen, Sparkles, Calendar, Hash, Share2, Plus } from 'lucide-react';

interface DashboardModernHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode;
}

const ICONS = [
  Users, MessageCircle, BookOpen, Sparkles, Calendar, Hash, Share2, Plus
];

// Use only theme color classes for icons
const iconThemeClasses = [
  'text-primary',
  'text-accent',
  'text-muted-foreground',
  'text-secondary',
  'text-primary/70',
  'text-accent/70',
  'text-muted-foreground/60',
  'text-secondary/60',
];

const DashboardModernHeader: React.FC<DashboardModernHeaderProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  children,
}) => (
  <div className="glass-card py-14 px-4 sm:px-10 flex flex-col items-center justify-center mb-10 relative overflow-hidden">
    {/* Themed Animated Icon Background */}
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <div className="absolute inset-0 w-full h-full">
        {ICONS.map((Icon, i) => (
          <Icon
            key={i}
            className={`absolute ${iconThemeClasses[i % iconThemeClasses.length]} opacity-20 dark:opacity-25 icon-bg-${i}`}
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${10 + (i * 15) % 70}%`,
              fontSize: `${60 + (i % 3) * 24}px`,
              width: `${60 + (i % 3) * 24}px`,
              height: `${60 + (i % 3) * 24}px`,
              zIndex: 1,
            }}
          />
        ))}
      </div>
      {/* Overlay removed so icons float over the card's normal background */}
    </div>
    <div className="relative z-10 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3 gradient-text drop-shadow-2xl text-balance text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-2xl text-muted-foreground mb-7 max-w-2xl mx-auto font-medium animate-fade-in text-balance text-center">
          {subtitle}
        </p>
      )}
      {buttonText && (
        <Button size="lg" className="btn-primary" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
      {children}
    </div>
    {/* Keyframes for icon animation */}
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @keyframes dashboard-icon-move-0 {
        0% { transform: translateY(0) scale(1) rotate(0deg); }
        100% { transform: translateY(-40px) scale(1.1) rotate(20deg); }
      }
      @keyframes dashboard-icon-move-1 {
        0% { transform: translateX(0) scale(1) rotate(0deg); }
        100% { transform: translateX(40px) scale(1.2) rotate(-15deg); }
      }
      @keyframes dashboard-icon-move-2 {
        0% { transform: translateY(0) scale(1) rotate(0deg); }
        100% { transform: translateY(30px) scale(0.95) rotate(10deg); }
      }
      @keyframes dashboard-icon-move-3 {
        0% { transform: translateX(0) scale(1) rotate(0deg); }
        100% { transform: translateX(-30px) scale(1.1) rotate(15deg); }
      }
      @keyframes dashboard-icon-move-4 {
        0% { transform: translateY(0) scale(1) rotate(0deg); }
        100% { transform: translateY(-30px) scale(1.05) rotate(-10deg); }
      }
      @keyframes dashboard-icon-move-5 {
        0% { transform: translateX(0) scale(1) rotate(0deg); }
        100% { transform: translateX(30px) scale(0.9) rotate(10deg); }
      }
      @keyframes dashboard-icon-move-6 {
        0% { transform: translateY(0) scale(1) rotate(0deg); }
        100% { transform: translateY(40px) scale(1.1) rotate(-20deg); }
      }
      @keyframes dashboard-icon-move-7 {
        0% { transform: translateX(0) scale(1) rotate(0deg); }
        100% { transform: translateX(-40px) scale(1.2) rotate(15deg); }
      }
      .icon-bg-0 { animation: dashboard-icon-move-0 7s ease-in-out infinite alternate; }
      .icon-bg-1 { animation: dashboard-icon-move-1 8s ease-in-out infinite alternate; }
      .icon-bg-2 { animation: dashboard-icon-move-2 6s ease-in-out infinite alternate; }
      .icon-bg-3 { animation: dashboard-icon-move-3 9s ease-in-out infinite alternate; }
      .icon-bg-4 { animation: dashboard-icon-move-4 7s ease-in-out infinite alternate; }
      .icon-bg-5 { animation: dashboard-icon-move-5 8s ease-in-out infinite alternate; }
      .icon-bg-6 { animation: dashboard-icon-move-6 6s ease-in-out infinite alternate; }
      .icon-bg-7 { animation: dashboard-icon-move-7 9s ease-in-out infinite alternate; }
    `,
      }}
    />
  </div>
);

export default DashboardModernHeader; 