import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { PLATFORM_NAME } from '@/data/constants';

interface WalletCardProps {
  wallet: string | number;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  return (
    <div className="relative w-full max-w-xs mx-auto rounded-2xl bg-gradient-to-br from-primary-400/80 to-primary-500/80 shadow-xl p-5 border border-white/30 backdrop-blur-md overflow-hidden flex flex-col">
      {/* Decorative Circles */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full z-0" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full z-0" />
      {/* Wallet Content */}
      <div className="relative z-10 flex flex-col items-start gap-2 flex-1">
        <span className="text-xs font-semibold text-white/80 tracking-wide">Wallet Balance</span>
        <span className="text-3xl font-bold text-white drop-shadow-lg">{wallet}</span>
        <span className="text-xs text-white/60 mt-1">{PLATFORM_NAME} Credits</span>
      </div>
      {/* Chip/Logo */}
      <div className="absolute top-5 right-5 w-10 h-7 bg-white/30 rounded-lg flex items-center justify-center shadow-inner">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.5" /></svg>
      </div>
      {/* Store Link */}
      <div className="relative z-10 mt-4 flex">
        <Link
          to="/student/store"
          className="flex items-center justify-center gap-1 text-xs px-2 py-2 rounded w-full transition-colors text-white/70 hover:text-white hover:bg-white/10 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/20 font-medium"
        >
          <Store className="w-4 h-4 mr-1 opacity-80" />
          Go to Store
        </Link>
      </div>
    </div>
  );
};

export default WalletCard; 