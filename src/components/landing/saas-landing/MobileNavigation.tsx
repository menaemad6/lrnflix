import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogInIcon, LogOut } from 'lucide-react';
import { PLATFORM_NAME } from '@/data/constants';
import type { RootState } from '@/store/store';

// Mobile Navigation Component
const MobileNavigation: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userRole: string;
  user: RootState['auth']['user'];
  onLogout: () => void;
}> = ({ isOpen, onClose, isAuthenticated, userRole, user, onLogout }) => {
  const navigate = useNavigate();

  const getMobileNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Browse Courses', action: () => { navigate('/courses'); onClose(); } },
        { label: 'Chapters', action: () => { navigate('/chapters'); onClose(); } },
        { label: 'Instructors', action: () => { navigate('/teachers'); onClose(); } },
      ];
    }

    if (userRole === 'student') {
      return [
        { label: 'Dashboard', action: () => navigate('/student/dashboard') },
        { label: 'My Courses', action: () => navigate('/student/courses') },
        { label: 'Chapters', action: () => navigate('/student/chapters') },
        { label: 'Groups', action: () => navigate('/student/groups') },
        { label: 'Browse Courses', action: () => navigate('/courses') },
        { label: 'Wallet', action: () => navigate('/student/transactions') }
      ];
    }

    if (userRole === 'teacher') {
      return [
        { label: 'Dashboard', action: () => navigate('/teacher/dashboard') },
        { label: 'My Courses', action: () => navigate('/teacher/courses') },
        { label: 'Chapters', action: () => navigate('/teacher/chapters') },
        { label: 'Groups', action: () => navigate('/teacher/groups') },
        { label: 'Analytics', action: () => navigate('/teacher/analytics') },
        { label: 'Wallet Codes', action: () => navigate('/teacher/codes') }
      ];
    }

    return [];
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-[9999]"
      />
      
      {/* Navigation Panel */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex flex-col bg-black"
        style={{ 
          height: '100vh', 
          width: '100vw'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 flex-shrink-0">
          <Link to="/" onClick={onClose} className="cursor-pointer flex items-center space-x-2">
            <img src="/assests/logo.png" alt="Logo" className="h-8 w-auto"/>
            <span className="text-white font-semibold text-xl">{PLATFORM_NAME}</span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-2 text-white"
            aria-label="Close mobile menu"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-2xl font-bold">×</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 space-y-6">
            {/* Navigation Links */}
            <div className="">
              {getMobileNavLinks().map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="w-full text-left py-2 text-white text-3xl font-semibold hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="px-6 pb-6 flex-shrink-0">
          {isAuthenticated ? (
            <div className="bg-neutral-900 border border-neutral-600 p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-white font-bold text-lg">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-gray-300 text-sm">
                  {user?.email}
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <button
                  onClick={onLogout}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Log Out
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-600 p-6 space-y-4">
                <button
                  onClick={() => { navigate('/auth/login'); onClose(); }}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Login
                  <LogOut className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { navigate('/auth/signup'); onClose(); }}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Create New Account
                  <LogInIcon className="h-5 w-5" />
                </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
