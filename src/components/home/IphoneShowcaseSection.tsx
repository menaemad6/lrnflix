import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface IphoneShowcaseSectionProps {
  leftTextTop?: string;
  leftTextBottom?: string;
  imageUrl?: string;
  imagePosition?: "right" | "left";
}

export const IphoneShowcaseSection: React.FC<IphoneShowcaseSectionProps> = ({
  leftTextTop = "Powerful",
  leftTextBottom = "Account.",
  imageUrl = "/lrnflix-iphone.jpg",
  imagePosition = "right",
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) {
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 40, damping: 24, duration: 3 } });
    }
  }, [inView, controls]);

  // Animation direction - reduced values to prevent overflow
  const initialX = imagePosition === "right" ? 200 : -200;
  const isRight = imagePosition === "right";

  return (
    <section
      ref={ref}
      className={`w-full flex ${isRight ? 'flex-row' : 'flex-row-reverse'} items-center justify-between min-h-[20vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-[90vh] xl:min-h-[110vh] px-4 md:px-24 py-12 gap-8 bg-transparent relative overflow-hidden`}
      style={{ background: "transparent" }}
    >
      <motion.div
        className="flex-1 flex items-center relative h-full z-0"
        style={{ 
          position: 'absolute', 
          [isRight ? 'right' : 'left']: 0, 
          top: 0, 
          bottom: 0,  
          pointerEvents: 'none',
          maxWidth: '50vw' // Prevent overflow
        }}
        initial={{ x: initialX, opacity: 0 }}
        animate={controls}
      >
        <img
          src={imageUrl}
          alt="Showcase visual"
          className="h-[18vh] sm:h-[40vh] md:h-[40vh] lg:h-[60vh] xl:h-[90vh] w-auto object-contain drop-shadow-2xl select-none"
          draggable={false}
          style={{ maxWidth: '100%' }}
        />
      </motion.div>
      <div
        className={`flex-1 flex flex-col justify-center z-10 ml-auto ${isRight ? 'items-start text-left' : 'items-end text-right'}`}
      >
        <h1 className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-black leading-tight mb-2">
          {leftTextTop}
        </h1>
        <h2 className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-black leading-tight">
          {leftTextBottom}
        </h2>
      </div>
    </section>
  );
};

export default IphoneShowcaseSection; 