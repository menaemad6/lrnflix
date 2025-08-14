import React from 'react';
import Waves from '@/components/react-bits/backgrounds/Waves/Waves';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '@/store/store';

const HeroSection: React.FC = () => {
  const { theme } = useTheme();
  const lineColor = theme === 'dark' ? '#094733' : '#95edd0';
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const companies = [
    'Browserbase',
    'Inngest',
    'Braintrust',
    'SUNO',
    'Durable',
    'OpenRouter',
    'TURSO',
    "Bally's"
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Waves Background */}
      <Waves
        lineColor={lineColor}
        backgroundColor="transparent"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-24 pb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
          Unlock Modern Learning<br className="hidden md:block" />
          <span className="text-emerald-500 dark:text-emerald-400">with {PLATFORM_NAME} LMS</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Empower your students and educators with AI-driven personalized learning, real-time analytics, interactive courses, and seamless collaboration—all in one beautiful, intuitive platform. <span className="text-emerald-600 dark:text-emerald-300 font-semibold">Experience the future of education today.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button className="h-12 px-8 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="h-12 px-8 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg">
                Get Started Free
              </Button>
            </Link>
          )}
          <Link to="/features">
            <Button variant="outline" className="h-12 px-8 text-lg rounded-full border border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-black font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              Explore Features
            </Button>
          </Link>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Trusted by fast-growing companies around the world</div>
        <div className="relative w-full overflow-hidden h-10 flex items-center justify-center mt-2">
          <div className="flex w-max animate-scroll-x whitespace-nowrap gap-12 text-lg font-semibold opacity-80" style={{animationDuration: '30s'}}>
            {companies.concat(companies).map((name, i) => (
              <span key={i} className="px-4 text-emerald-700 dark:text-emerald-300">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 