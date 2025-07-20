import React from 'react';
import { motion, Variants } from 'framer-motion';

interface Stat {
  stat: string;
  label: string;
}
interface StatsOverlayProps {
  stats: Stat[];
  variants: Variants;
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({ stats, variants }) => (
  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/5 flex gap-16 z-20">
    {stats.map((item, i) => (
      <motion.div
        key={item.stat}
        className="text-center text-white drop-shadow-lg"
        custom={i}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-4xl font-bold">{item.stat}</div>
        <div className="text-sm opacity-90">{item.label}</div>
      </motion.div>
    ))}
  </div>
);

export default StatsOverlay; 