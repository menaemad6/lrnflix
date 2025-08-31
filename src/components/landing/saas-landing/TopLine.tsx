import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const TopLine: React.FC = () => {
  return (
    <div className="bg-black text-white p-3 text-sm text-center cursor-pointer h-12 flex items-center justify-center">
      <span className="hidden sm:inline pr-2 opacity-80">
        🚀 First AI-powered gamified learning platform in Egypt
      </span>
      <span className="pr-1">
        <Link to="/auth/signup">
          Start learning for free <FaArrowRight className="inline h-2 w-2" />
        </Link>
      </span>
    </div>
  );
};

export default TopLine;
