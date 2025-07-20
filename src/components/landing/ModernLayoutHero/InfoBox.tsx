import React from 'react';
import { motion, Variants } from 'framer-motion';

interface InfoBoxProps {
  variants: Variants;
  initial?: string;
  animate?: string;
  children?: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ variants, initial = 'hidden', animate = 'visible', children }) => (
  <motion.div
    className="absolute bottom-28 left-2 bg-background dark:bg-background backdrop-blur-sm p-6 max-w-sm h-[220px]"
    style={{
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 60% 100%, 0 80%)',
      borderBottomLeftRadius: '2.5rem',
      borderTopRightRadius: '1.5rem',
      borderTopLeftRadius: '0',
      borderBottomRightRadius: '0',
      zIndex: 40,
    }}
    variants={variants}
    initial={initial}
    animate={animate}
  >
    {children}
  </motion.div>
);

export default InfoBox; 