import React from 'react';
import Waves from '@/components/react-bits/backgrounds/Waves/Waves';
import { useTheme } from '@/contexts/ThemeContext';

interface WavesHeroHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

const WavesHeroHeader: React.FC<WavesHeroHeaderProps> = ({ title, description, className = '' }) => {
  const { theme } = useTheme();
  const lineColor = theme === 'dark' ? '#094733' : '#95edd0';

  return (
    <section className={`relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-background/80 py-10 px-4 sm:px-8 ${className}`}>
      {/* Waves Background */}
      <Waves
        lineColor={lineColor}
        backgroundColor="transparent"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-2 py-8 pt-[140px] pb-[95px] z-10 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-0 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default WavesHeroHeader; 