import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface FeaturesDropdownProps {
  links: { to: string; label: string }[];
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 * i, type: 'spring', stiffness: 80, damping: 16 },
  }),
};

const FeaturesDropdown: React.FC<FeaturesDropdownProps> = ({ links }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="px-6 py-3 bg-card/90 dark:bg-card/80 backdrop-blur-sm text-foreground rounded-full shadow-lg hover:bg-card/95 dark:hover:bg-card/90 flex items-center gap-2 font-medium">
        <span>Home</span>
        <ChevronDown className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" asChild>
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{}}
      >
        {links.map((link, i) => (
          <motion.li
            key={link.to}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <DropdownMenuItem asChild>
              <Link to={link.to}>{link.label}</Link>
            </DropdownMenuItem>
          </motion.li>
        ))}
      </motion.ul>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default FeaturesDropdown; 