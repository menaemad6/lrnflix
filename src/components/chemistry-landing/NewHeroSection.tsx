import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpeg';

export const NewHeroSection = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      >
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between p-8 lg:p-12">
        
        {/* Top Section */}
        <div className="flex justify-between items-start">
          
          {/* Top Left - Title, Subtitle, CTA */}
          <div className="flex flex-col space-y-6 max-w-lg">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-black leading-tight">
                تعلم الكيمياء
                <br />
                <span className="text-black">بأسلوب تفاعلي</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed">
                انضم إلى أفضل منصة لتعليم الكيمياء للمرحلة الثانوية مع دروس تفاعلية ومواد شاملة
              </p>
            </div>
            <Button 
              size="lg" 
              className="w-fit bg-white hover:bg-gray-100 text-black px-8 py-4 text-lg font-semibold border border-black"
            >
              ابدأ التعلم الآن
            </Button>
          </div>

          {/* Top Right - Title and Subtitle */}
          <div className="flex flex-col space-y-4 max-w-md text-right">
            <h2 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
              مع أفضل
              <br />
              <span className="text-black">المدرسين</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-800 leading-relaxed">
              خبرة سنوات في تدريس الكيمياء مع أساليب تعليمية حديثة ومبتكرة
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          
          {/* Bottom Left - Paragraph and Social Media */}
          <div className="flex flex-col space-y-6 max-w-lg">
            <p className="text-lg text-gray-800 leading-relaxed">
              انضم إلى آلاف الطلاب الذين حققوا نتائج متميزة في الكيمياء من خلال منصتنا التعليمية المتطورة
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 space-x-reverse">
              <a 
                href="#" 
                className="p-3 bg-black/10 hover:bg-black/20 rounded-full transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6 text-black" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-black/10 hover:bg-black/20 rounded-full transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 text-black" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-black/10 hover:bg-black/20 rounded-full transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6 text-black" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-black/10 hover:bg-black/20 rounded-full transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6 text-black" />
              </a>
            </div>
          </div>

          {/* Bottom Right - Empty space for balance */}
          <div className="max-w-md"></div>
        </div>
      </div>
    </section>
  );
};
