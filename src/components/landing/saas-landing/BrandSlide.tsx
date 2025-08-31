import React from 'react';
import { motion } from 'framer-motion';

// Brand Slide Component
const BrandSlide: React.FC = () => {
  return (
    <div className="pt-8 bg-white px-4 md:p-12 flex justify-center">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)] w-[1200px]">
        <motion.div
          className="flex gap-14 flex-none items-center justify-center pr-14"
          animate={{
            translateX: "-50%",
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          <img src="/assests/logo-acme.png" alt="Cairo University" className="h-8 w-auto" />
          <img src="/assests/logo-apex.png" alt="Ain Shams University" className="h-8 w-auto" />
          <img src="/assests/logo-celestial.png" alt="Alexandria University" className="h-8 w-auto" />
          <img src="/assests/logo-echo.png" alt="Mansoura University" className="h-8 w-auto" />
          <img src="/assests/logo-pulse.png" alt="Zagazig University" className="h-8 w-auto" />
          <img src="/assests/logo-quantum.png" alt="Assiut University" className="h-8 w-auto" />

          <img src="/assests/logo-acme.png" alt="Cairo University" className="h-8 w-auto" />
          <img src="/assests/logo-apex.png" alt="Ain Shams University" className="h-8 w-auto" />
          <img src="/assests/logo-celestial.png" alt="Alexandria University" className="h-8 w-auto" />
          <img src="/assests/logo-echo.png" alt="Mansoura University" className="h-8 w-auto" />
          <img src="/assests/logo-pulse.png" alt="Zagazig University" className="h-8 w-auto" />
          <img src="/assests/logo-quantum.png" alt="Assiut University" className="h-8 w-auto" />
        </motion.div>
      </div>
    </div>
  );
};

export default BrandSlide;
