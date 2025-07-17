import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hyperspeed from '@/components/react-bits/backgrounds/Hyperspeed/Hyperspeed';

interface HyperspeedCardSectionProps {
  title: React.ReactNode;
  description: React.ReactNode;
  className?: string;
  cardBgClass?: string;
  children?: React.ReactNode;
}

const MorphingCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const width = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["100%", "95%", "90%", "85%"]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ["0px", "32px"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.98, 0.95]);
  return (
    <motion.div
      ref={ref}
      style={{ width, borderRadius, scale }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HyperspeedCardSection: React.FC<HyperspeedCardSectionProps> = ({
  title,
  description,
  className = '',
  cardBgClass = '',
  children,
}) => (
  <section className={`w-full flex justify-center items-center py-12 relative ${className}`}>
    <MorphingCard className={`relative shadow-2xl min-h-[220px] md:min-h-[260px] flex flex-col justify-start ${cardBgClass}`}>
      {/* Content overlay at the top */}
      <div className="relative z-10 w-full px-6 pt-6 md:pt-8 pb-4 md:pb-6 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center gradient-text">{title}</h2>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 text-center max-w-2xl">
          {description}
        </p>
        {children}
      </div>
      {/* Hyperspeed animated background at the bottom */}
      <div className="relative w-full h-[220px] md:h-[320px]">
        <Hyperspeed />
      </div>
    </MorphingCard>
  </section>
);

export default HyperspeedCardSection; 