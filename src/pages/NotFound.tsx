import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRandomBackground } from "../hooks/useRandomBackground";
import { Button } from "@/components/ui/button";
import { Bug, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bgClass = useRandomBackground();
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`${bgClass} min-h-screen flex items-center justify-center bg-background`}> 
      <div className="glass-card max-w-xl w-full mx-auto text-center py-6 px-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-border/30 flex flex-col items-center animate-fade-in">
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 animate-glow-pulse shadow-lg">
            <Bug className="text-primary w-14 h-14 animate-spin-slow" />
          </span>
        </div>
        <span className="gradient-text text-[5rem] md:text-[7rem] block mb-2 font-extrabold drop-shadow-2xl select-none leading-none">404</span>
        <div className="text-3xl md:text-4xl text-balance text-primary font-bold mb-4 tracking-tight animate-fade-in">
          {t('notFound.title')}
        </div>
        <div className="text-muted-foreground mb-10 text-lg md:text-xl animate-fade-in">
          {t('notFound.message')}
        </div>
        <Button
          size="lg"
          className="rounded-full px-10 py-4 text-lg font-semibold shadow-xl animate-glow-pulse bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0"
          onClick={() => navigate("/")}
        >
          {t('notFound.goHome')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
