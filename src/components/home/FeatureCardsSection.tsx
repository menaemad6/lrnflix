import React from 'react';
import { motion } from 'framer-motion';
import Threads from '@/components/react-bits/backgrounds/Threads/Threads';
import Silk from '@/components/react-bits/backgrounds/Silk/Silk';
import Hyperspeed from '@/components/react-bits/backgrounds/Hyperspeed/Hyperspeed';
import LiquidChrome from '@/components/react-bits/backgrounds/LiquidChrome/LiquidChrome';
import { Button } from '@/components/ui/button';

const cards = [
  {
    title: 'AI-Powered Tutoring',
    desc: 'Personalized learning paths and instant feedback powered by advanced artificial intelligence.',
    bg: <Threads amplitude={1.5} distance={0.2} enableMouseInteraction={true} />,
    colSpan: 'lg:col-span-6',
    delay: 0.1,
    side: 'left',
  },
  {
    title: 'Collaborative Classrooms',
    desc: 'Real-time group discussions, project workspaces, and peer-to-peer learning tools.',
    bg: <Silk />,
    colSpan: 'lg:col-span-4',
    delay: 0.2,
    side: 'right',
  },
  {
    title: 'Gamified Progress',
    desc: 'Earn badges, level up, and unlock achievements as you master new skills and complete courses.',
    bg: <LiquidChrome />,
    colSpan: 'lg:col-span-4',
    delay: 0.4,
    side: 'left',
  },
  {
    title: 'Seamless Integrations',
    desc: 'Connect with your favorite tools, import/export content, and automate workflows effortlessly.',
    bg: <Hyperspeed />,
    colSpan: 'lg:col-span-6',
    delay: 0.3,
    side: 'right',
  },
];

const FeatureCardsSection: React.FC = () => (
  <section className="py-32">
    <div className="container mx-auto px-8">
      <h2 className="text-5xl font-extrabold text-center mb-16 tracking-tight gradient-text">
        Next-Gen Learning Features
      </h2>
      <div className="grid grid-cols-10 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            className={`col-span-10 ${card.colSpan} bg-white dark:bg-black shadow-lg overflow-hidden flex flex-col h-[500px] relative`}
            initial={{ opacity: 0, x: card.side === 'left' ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: card.delay }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Animated background (full card) */}
            <div className="absolute inset-0 z-0">
              {card.bg}
              {/* Top overlay for text readability */}
              <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/90 dark:from-black/90 to-transparent pointer-events-none" />
            </div>
            {/* Text area (top, above overlay) */}
            <div className="relative z-10 p-8 flex flex-col justify-center h-[45%]">
              <h3 className="text-3xl font-bold mb-3 break-words leading-tight">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-5">{card.desc}</p>
              <Button className="bg-gray-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors px-8 py-3 rounded-xl self-start inline-block w-auto min-w-[160px] text-center">
                Learn More
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureCardsSection; 