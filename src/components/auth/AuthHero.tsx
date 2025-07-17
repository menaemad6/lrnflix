
import React from "react";
import { BookOpen, Users, Award, TrendingUp, Sparkles } from "lucide-react";

// THEME COLORS: Emerald, Teal, Cyan, Slate. NO yellow/orange.

interface AuthHeroProps {
  title?: string;
  highlight?: string;
  subtitle?: string;
}

export const AuthHero: React.FC<AuthHeroProps> = ({
  title = "Unlock Your",
  highlight = "Premium Learning Experience",
  subtitle = "Master new skills, connect, and grow with our vibrant learning community — all in style.",
}) => (
  <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 overflow-hidden min-h-screen select-none">
    {/* Super animated floating theme blobs */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-16 right-24 w-96 h-96 bg-cyan-400/12 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/4 w-44 h-44 bg-teal-400/20 rounded-full blur-2xl animate-pulse" />
      {/* More glass/floating sparkles */}
      <div className="absolute top-2/3 left-10 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-1/4 right-40 w-48 h-20 bg-cyan-700/25 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-7 right-64 w-20 h-40 bg-teal-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }} />
      {/* Sparkle icon as floating */}
      <Sparkles className="absolute left-24 bottom-24 text-cyan-400/50 w-16 h-16 animate-fade-in" style={{ animationDelay: "0.5s" }} />
    </div>
    <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12 h-full text-white min-h-screen">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mr-4 shadow-lg border border-emerald-500/30">
          <BookOpen className="w-6 h-6 text-emerald-300" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-wider gradient-text drop-shadow">Learnify</h1>
      </div>
      <h2 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight text-balance gradient-text">
        {title}
        <span className="block gradient-text drop-shadow">{highlight}</span>
      </h2>
      <p className="text-xl text-white/80 mb-10 max-w-md leading-relaxed">{subtitle}</p>
      <div className="grid grid-cols-3 gap-7 mb-8">
        <div className="text-center animate-fade-in" style={{ animationDelay: ".2s" }}>
          <div className="flex items-center justify-center w-14 h-14 bg-emerald-700/50 rounded-2xl backdrop-blur-sm mb-2 mx-auto border border-emerald-500/20">
            <Users className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="text-xl font-bold gradient-text">50K+</div>
          <div className="text-emerald-100/80 text-xs">Learners</div>
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: ".4s" }}>
          <div className="flex items-center justify-center w-14 h-14 bg-teal-700/40 rounded-2xl backdrop-blur-sm mb-2 mx-auto border border-teal-500/20">
            <Award className="w-7 h-7 text-teal-300" />
          </div>
          <div className="text-xl font-bold gradient-text">1000+</div>
          <div className="text-teal-100/80 text-xs">Courses</div>
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: ".6s" }}>
          <div className="flex items-center justify-center w-14 h-14 bg-cyan-700/40 rounded-2xl backdrop-blur-sm mb-2 mx-auto border border-cyan-500/20">
            <TrendingUp className="w-7 h-7 text-cyan-300" />
          </div>
          <div className="text-xl font-bold gradient-text">95%</div>
          <div className="text-cyan-100/80 text-xs">Success</div>
        </div>
      </div>
      {/* Quieter testimonial, removed colored avatar */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col gap-2 shadow-inner">
        <p className="text-white/90 italic mb-0 text-balance text-lg">
          “Stunning platform, learning has never felt so seamless and modern.”
        </p>
        <div className="flex items-center mt-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">L</span>
          <div className="ml-3">
            <div className="font-semibold text-white">Lucas Knight</div>
            <div className="text-white/60 text-xs">Startup Founder</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
