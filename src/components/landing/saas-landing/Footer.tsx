import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaTwitter, 
  FaPinterest, 
  FaTiktok, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';
import { MdOutlineArrowOutward } from 'react-icons/md';
import { PLATFORM_NAME } from '@/data/constants';
import PoliciesModal from '../PoliciesModal';
import type { RootState } from '@/store/store';

// Footer Component
const Footer: React.FC = () => {
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('privacy');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';

  const handleLegalLinkClick = (tab: string) => {
    setActiveLegalTab(tab);
    setIsPoliciesModalOpen(true);
  };

  const handleClosePoliciesModal = () => {
    setIsPoliciesModalOpen(false);
  };

  // Function to get appropriate navigation links based on user role
  const getPlatformLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Gamified Learning', path: '/auth/login?next=/multiplayer-quiz' },
        { label: 'Instructors', path: '/teachers' },
        { label: 'Browse Courses', path: '/courses' },
        { label: 'Chapters', path: '/chapters' },
        { label: 'Analytics', path: '/auth/signup?next=/student/dashboard' },


      ];
    }

    if (userRole === 'teacher') {
      return [
        { label: 'Dashboard', path: '/teacher/dashboard' },
        { label: 'My Courses', path: '/teacher/courses' },
        { label: 'My Chapters', path: '/teacher/chapters' },
        { label: 'Learning Groups', path: '/teacher/groups' },
        { label: 'Gamified Learning', path: '/teacher/multiplayer-quiz' },
        { label: 'Analytics', path: '/teacher/analytics' },
      ];
    }

    // Student role
    return [
      { label: 'Dashboard', path: '/student/dashboard' },
      { label: 'My Courses', path: '/student/courses' },
      { label: 'My Chapters', path: '/student/chapters' },
      { label: 'Gamified Learning', path: '/multiplayer-quiz' },
      { label: 'Learning Groups', path: '/student/groups' },
      { label: 'Wallet', path: '/student/transactions' },
    ];
  };

  const platformLinks = getPlatformLinks();

  return (
    <>
      <div className="flex flex-col md:flex-row bg-black text-white p-8 md:p-16 gap-8 justify-between px-6 md:px-20 xl:px-44">
        <div className="flex flex-col gap-8 text-gray-300/85 max-w-[300px]">
          <div className="flex items-center space-x-3">
            <img src="/assests/logo.png" alt="Logo" className="cursor-pointer h-12 w-12" />
            <span className="text-white font-semibold text-2xl">{PLATFORM_NAME}</span>
          </div>
          <div>
            Egypt's first AI-powered learning platform developed by{" "}
            <div className="font-semibold text-white hover:underline text-lg">
              <a href="https://mina-emad.com">
                Mena Emad <MdOutlineArrowOutward className="inline" />
              </a>
            </div>
          </div>
          <div className="flex gap-4 text-2xl cursor-pointer">
            <FaTwitter className="hover:scale-125" />
            <AiFillInstagram className="hover:scale-125" />
            <FaPinterest className="hover:scale-125" />
            <FaLinkedin className="hover:scale-125" />
            <FaTiktok className="hover:scale-125" />
            <FaYoutube className="hover:scale-125" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-bold text-lg">Platform</div>
          {platformLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-gray-300/85 hover:text-white transition-colors cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-bold text-lg">Company</div>
          <Link 
            to="/#about" 
            className="text-gray-300/85 hover:text-white transition-colors cursor-pointer"
          >
            About
          </Link>
          <Link 
            to="/#mission" 
            className="text-gray-300/85 hover:text-white transition-colors cursor-pointer"
          >
            Mission
          </Link>
          <Link 
            to="/#contact" 
            className="text-gray-300/85 hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-bold text-lg">Legal</div>
          <div 
            className="cursor-pointer text-gray-300/85 hover:text-white transition-colors"
            onClick={() => handleLegalLinkClick('privacy')}
          >
            Privacy
          </div>
          <div 
            className="cursor-pointer text-gray-300/85 hover:text-white transition-colors"
            onClick={() => handleLegalLinkClick('terms')}
          >
            Terms
          </div>
          <div 
            className="cursor-pointer text-gray-300/85 hover:text-white transition-colors"
            onClick={() => handleLegalLinkClick('help')}
          >
            Security
          </div>
        </div>
      </div>

      <PoliciesModal
        isOpen={isPoliciesModalOpen}
        onClose={handleClosePoliciesModal}
        initialTab={activeLegalTab}
      />
    </>
  );
};

export default Footer;
