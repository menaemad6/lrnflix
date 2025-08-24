
import React from 'react';
import { motion } from 'framer-motion';

interface WaveSeparatorProps {
  flip?: boolean;
  variant?: 'wave' | 'angular' | 'organic' | 'geometric' | 'diagonal';
  className?: string;
}

export const WaveSeparator: React.FC<WaveSeparatorProps> = ({ 
  flip = false, 
  variant = 'wave', 
  className = "" 
}) => {
  const variants = {
    wave: "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
    angular: "M0,0 L400,60 L800,20 L1200,80 L1200,0 Z M0,120 L300,40 L700,100 L1200,60 L1200,120 Z",
    organic: "M0,20 C150,100 350,0 500,80 C650,160 850,40 1000,120 C1150,200 1350,100 1500,180 L1500,0 L0,0 Z",
    geometric: "M0,0 L200,50 L400,20 L600,70 L800,30 L1000,60 L1200,40 L1200,0 Z",
    diagonal: "M0,0 L1200,120 L1200,0 Z"
  };
  
  return (
    <div className={`relative w-full ${flip ? 'transform rotate-180' : ''} ${className}`}>
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className="w-full h-16 lg:h-24"
      >
        <motion.path 
          d={variants[variant]}
          fill="currentColor"
          className="text-white"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};
