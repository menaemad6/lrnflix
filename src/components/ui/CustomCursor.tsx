import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isPointer, setIsPointer] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 500 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      const isClickable =
        window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer' ||
        !!target.closest('a, button');

      const isText = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(target.tagName);

      setIsPointer(isClickable);
      setIsHoveringText(isText && !isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorX, cursorY]);

  const dotSize = 8;
  const ringSize = isPointer ? 32 : (isHoveringText ? 48 : 32);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] border-2"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          left: -ringSize / 2,
          top: -ringSize / 2,
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          borderColor: isPointer ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 255, 136, 0.5)',
          backgroundColor: isHoveringText ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          left: -dotSize / 2,
          top: -dotSize / 2,
        }}
        animate={{
          width: dotSize,
          height: dotSize,
          backgroundColor: isPointer ? '#ffffff' : '#00ff88',
          mixBlendMode: isPointer ? 'difference' : 'normal',
          scale: isPointer ? 0.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 30 }}
      />
    </>
  );
};

export default CustomCursor;
