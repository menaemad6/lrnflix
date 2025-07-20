import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingExpertCardProps {
  variants: Variants;
  initial?: string;
  animate?: string;
}

const FloatingExpertCard: React.FC<FloatingExpertCardProps> = ({ variants, initial = 'hidden', animate = 'visible' }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="absolute top-44 right-5 z-40 bg-card dark:bg-card/80 rounded-2xl p-4 shadow-xl w-64 flex items-center gap-3 cursor-pointer outline-none"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      variants={variants}
      initial={initial}
      animate={animate}
      role="button"
      tabIndex={0}
      onClick={() => navigate('/teachers')}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/teachers'); }}
    >
      <div
        className="w-16 h-16 rounded-xl bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80')`,
        }}
      ></div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground text-base leading-tight">Expert Instructors</h3>
      </div>
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <ArrowRight className="w-4 h-4 text-primary-foreground" />
      </div>
    </motion.div>
  );
};

export default FloatingExpertCard; 