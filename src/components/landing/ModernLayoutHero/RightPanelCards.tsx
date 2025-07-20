import React from 'react';
import { motion, Variants } from 'framer-motion';

interface RightPanelCardsProps {
  cards: React.ReactNode[];
  variants: Variants;
}

const RightPanelCards: React.FC<RightPanelCardsProps> = ({ cards, variants }) => (
  <div className="flex-1 p-8 pt-28 space-y-6">
    {cards.map((card, i) => (
      <motion.div
        key={i}
        custom={i}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {card}
      </motion.div>
    ))}
  </div>
);

export default RightPanelCards; 