import React from 'react';
import { motion, Variants } from 'framer-motion';

interface SocialIcon {
  href: string;
  icon: React.ReactNode;
}
interface SocialIconsProps {
  icons: SocialIcon[];
  variants: Variants;
}

const SocialIcons: React.FC<SocialIconsProps> = ({ icons, variants }) => (
  <div className="flex gap-3">
    {icons.map((item, i) => (
      <motion.a
        key={item.href}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 cursor-pointer"
        custom={i}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {item.icon}
      </motion.a>
    ))}
  </div>
);

export default SocialIcons; 