
import React, { createContext, useContext, useState } from 'react';

export type QuizTheme = 'arcade' | 'cyberpunk' | 'minimal';

interface QuizThemeContextType {
  theme: QuizTheme;
  setTheme: (theme: QuizTheme) => void;
  getThemeClasses: () => string;
}

const QuizThemeContext = createContext<QuizThemeContextType | undefined>(undefined);

export const useQuizTheme = () => {
  const context = useContext(QuizThemeContext);
  if (!context) {
    throw new Error('useQuizTheme must be used within a QuizThemeProvider');
  }
  return context;
};

export const QuizThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<QuizTheme>('arcade');

  const getThemeClasses = () => {
    switch (theme) {
      case 'arcade':
        return 'bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900';
      case 'cyberpunk':
        return 'bg-gradient-to-br from-cyan-950 via-teal-900 to-green-900';
      case 'minimal':
        return 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900';
      default:
        return 'bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900';
    }
  };

  return (
    <QuizThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </QuizThemeContext.Provider>
  );
};
