import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  className?: string;
}
interface RightPanelNavigationProps {
  navItems: NavItem[];
}

export const navBarVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, x: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 16,
      delay: 1.1,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};
export const navIconVariants: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: 0,
    scale: 0.7,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 14,
      delay: 1.2 + i * 0.08,
    },
  }),
};

const RightPanelNavigation: React.FC<RightPanelNavigationProps> = ({ navItems }) => (
  <motion.div
    className="absolute top-4 right-8 z-20"
    variants={navBarVariants}
    initial="hidden"
    animate="visible"
  >
    <div className="flex items-center gap-8 xl:gap-16 xxl:gap-24 bg-card/90 dark:bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
      {navItems.map((item, i) => (
        <Link key={i} to={item.to}>
          <motion.div
            className={item.className}
            custom={i}
            variants={navIconVariants}
            initial="hidden"
            animate="visible"
          >
            {item.icon}
          </motion.div>
        </Link>
      ))}
    </div>
  </motion.div>
);

export default RightPanelNavigation; 