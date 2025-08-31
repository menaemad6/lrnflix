import React from 'react';
import { ButtonProps } from './types';

// Local Button Component (renamed to avoid conflict)
const LocalButton: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer" onClick={onClick}>
      {text}
    </button>
  );
};

export default LocalButton;
