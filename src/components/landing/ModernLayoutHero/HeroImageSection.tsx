import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface HeroImageSectionProps extends MotionProps {
  children?: React.ReactNode;
}

const clipSteps = [
  // All points at center
  'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  // Reveal first two points
  'polygon(100% 22%, 71% 22%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  // Reveal three points
  'polygon(100% 22%, 71% 22%, 69% 1%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  // Reveal four points
  'polygon(100% 22%, 71% 22%, 69% 1%, 1% 1%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  // Reveal five points
  'polygon(100% 22%, 71% 22%, 69% 1%, 1% 1%, 1% 74%, 50% 50%, 50% 50%, 50% 50%)',
  // Reveal six points
  'polygon(100% 22%, 71% 22%, 69% 1%, 1% 1%, 1% 74%, 27% 71%, 50% 50%, 50% 50%)',
  // Reveal seven points
  'polygon(100% 22%, 71% 22%, 69% 1%, 1% 1%, 1% 74%, 27% 71%, 30% 98%, 50% 50%)',
  // Final shape
  'polygon(100% 22%, 71% 22%, 69% 1%, 1% 1%, 1% 74%, 27% 71%, 30% 98%, 98% 97%)',
];

const HeroImageSection: React.FC<HeroImageSectionProps> = ({ children, ...motionProps }) => (
  <motion.div
    initial={{ clipPath: clipSteps[0] }}
    animate={{
      clipPath: clipSteps,
      transition: {
        duration: 1.6,
        times: [0, 0.13, 0.26, 0.39, 0.52, 0.65, 0.78, 1],
        ease: 'easeInOut',
      },
    }}
    className="relative flex-1 bg-cover bg-center"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
      clipPath: clipSteps[clipSteps.length - 1],
      WebkitClipPath: clipSteps[clipSteps.length - 1],
      overflow: 'hidden',
      borderTopLeftRadius: '2.5rem',
      borderBottomLeftRadius: '2.5rem',
    }}
    {...motionProps}
  >
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-tl-3xl rounded-bl-3xl"></div>
    {children}
  </motion.div>
);

export default HeroImageSection; 