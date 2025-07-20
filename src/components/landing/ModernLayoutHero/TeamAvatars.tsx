import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TeamAvatarsProps {
  avatars: string[];
  variants: Variants;
}

const TeamAvatars: React.FC<TeamAvatarsProps> = ({ avatars, variants }) => (
  <div className="flex -space-x-2">
    {avatars.map((bg, i) => (
      <motion.div
        key={bg}
        className="w-10 h-10 rounded-full bg-muted border-2 border-card bg-cover bg-center"
        style={{ backgroundImage: bg }}
        custom={i}
        variants={variants}
        initial="hidden"
        animate="visible"
      />
    ))}
  </div>
);

export default TeamAvatars; 