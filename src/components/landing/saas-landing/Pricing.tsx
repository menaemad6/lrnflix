import React from 'react';
import { IoMdCheckmark } from 'react-icons/io';

// Pricing Component
const Pricing: React.FC = () => {
  return (
    <div className="mb-8 bg-white pt-4">
      <div className="flex flex-col items-center font-medium mt-16 mb-12 px-12 mx-auto max-w-[550px]">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
         Affordable Learning
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Choose your learning plan
        </div>

        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Start your AI-powered learning journey with our flexible pricing plans. 
          From free access to premium features, we have options for every learner and educator.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center pb-20 gap-8">
        <div className="shadow-xl border-gray-100 border-2 rounded-2xl p-8">
          <div className="font-bold text-gray-500">Student</div>
          <div className="py-8">
            <span className="font-extrabold text-5xl text-black">$0</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-white mb-8 bg-black py-1.5 w-full rounded-lg cursor-pointer">
            Start learning free
          </button>
          <div className="flex flex-col gap-6">
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Access to free courses
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Basic AI tutor access
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Multiplayer quiz games
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" /> Community discussions
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Basic support
            </div>
          </div>
        </div>

        <div className="shadow-2xl border-2 rounded-2xl p-8 bg-black text-white">
          <div className="flex justify-between items-center">
            <div className="font-bold text-gray-500">Premium</div>
            <div className="border-2 w-fit p-0.5 px-3 text-xs rounded-xl border-slate-300/20 bg-gradient-to-r from-pink-500  via-lime-600 to-sky-400 text-transparent bg-clip-text font-bold tracking-tighter">
              Most Popular
            </div>
          </div>
          <div className="py-8">
            <span className="font-extrabold text-5xl">$9</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-black font-medium mb-8 bg-white py-1.5 w-full rounded-lg cursor-pointer">
            Upgrade now
          </button>
          <div className="flex flex-col gap-6">
            <div>
              <IoMdCheckmark className="inline mr-2" /> Unlimited course access
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Advanced AI tutor features
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Priority quiz matchmaking
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Advanced analytics
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Priority support
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Custom learning paths
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Export certificates
            </div>
          </div>
        </div>
        <div className="shadow-xl border-gray-100 border-2 rounded-2xl p-8">
          <div className="font-bold text-gray-500">Institution</div>
          <div className="py-8">
            <span className="font-extrabold text-5xl text-black">$29</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-white mb-8 bg-black py-1.5 w-full rounded-lg cursor-pointer">
            Contact sales
          </button>
          <div className="flex flex-col gap-6">
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Unlimited students
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Advanced course management
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> AI-powered insights
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" /> Custom branding
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Dedicated support
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Advanced security
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" />
              API access
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              White-label solution
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              Training & onboarding
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              Custom integrations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
