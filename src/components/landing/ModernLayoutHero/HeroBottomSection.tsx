import React from 'react';

interface HeroBottomSectionProps {
  cta: React.ReactNode;
  socialIcons: React.ReactNode;
  avatars: React.ReactNode;
}

const HeroBottomSection: React.FC<HeroBottomSectionProps> = ({ cta, socialIcons, avatars }) => (
  <div className="bg-background px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16 lg:py-8 lg:gap-8">
    {cta}
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 lg:gap-8">
      {socialIcons}
      {avatars}
    </div>
  </div>
);

export default HeroBottomSection; 