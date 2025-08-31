import React, { useState } from 'react';
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

// Footer Component
const Footer: React.FC = () => {
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('privacy');

  const handleLegalLinkClick = (tab: string) => {
    setActiveLegalTab(tab);
    setIsPoliciesModalOpen(true);
  };

  const handleClosePoliciesModal = () => {
    setIsPoliciesModalOpen(false);
  };

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
          <div className="cursor-pointer text-gray-300/85">AI Tutor</div>
          <div className="cursor-pointer text-gray-300/85">Gamified Learning</div>
          <div className="cursor-pointer text-gray-300/85">Course Management</div>
          <div className="cursor-pointer text-gray-300/85">Analytics</div>
          <div className="cursor-pointer text-gray-300/85">Pricing</div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-bold text-lg">Company</div>
          <div className="cursor-pointer text-gray-300/85">About</div>
          <div className="cursor-pointer text-gray-300/85">Blog</div>
          <div className="cursor-pointer text-gray-300/85">Careers</div>
          <div className="cursor-pointer text-gray-300/85">Mission</div>
          <div className="cursor-pointer text-gray-300/85">Press</div>
          <div className="cursor-pointer text-gray-300/85">Contact</div>
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
