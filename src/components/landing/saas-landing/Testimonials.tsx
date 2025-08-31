import React from 'react';
import { motion } from 'framer-motion';
import { TestimonialData } from './types';

// Testimonials Component
const Testimonials: React.FC = () => {
  const testimonials: TestimonialData[] = [
    {
      id: 1,
      text: "Lrnflix has completely transformed how I teach. The AI-powered question generation saves me hours, and my students love the gamified learning experience.",
      name: "Dr. Ahmed Hassan",
      handle: "Computer Science Professor",
      avatar: "/assests/avatar-1.png"
    },
    {
      id: 2,
      text: "As Egypt's first AI-powered learning platform, Lrnflix has set a new standard for educational technology. The multiplayer quizzes make learning fun and competitive.",
      name: "Sarah Mahmoud",
      handle: "High School Teacher",
      avatar: "/assests/avatar-6.png"
    },
    {
      id: 3,
      text: "The AI tutor Hossam is incredible! It's like having a personal tutor available 24/7. This platform is exactly what Egypt's education system needed.",
      name: "Omar El-Sayed",
      handle: "University Student",
      avatar: "/assests/avatar-3.png"
    },
    {
      id: 4,
      text: "I've tried many learning platforms, but Lrnflix's gamification features and AI insights are unmatched. It's revolutionizing education in Egypt.",
      name: "Fatima Ali",
      handle: "Educational Consultant",
      avatar: "/assests/avatar-7.png"
    },
    {
      id: 5,
      text: "The personalized learning paths and AI recommendations have helped my students improve dramatically. This is the future of education.",
      name: "Dr. Karim Mostafa",
      handle: "Engineering Professor",
      avatar: "/assests/avatar-2.png"
    },
    {
      id: 6,
      text: "Finally, an Egyptian platform that competes with international standards! The AI-powered features and gamified learning make studying enjoyable.",
      name: "Layla Ahmed",
      handle: "Medical Student",
      avatar: "/assests/avatar-5.png"
    },
    {
      id: 7,
      text: "Lrnflix's multiplayer quiz system has created a competitive learning environment that motivates my students to study harder and perform better.",
      name: "Prof. Hana Ibrahim",
      handle: "Mathematics Department",
      avatar: "/assests/avatar-4.png"
    },
    {
      id: 8,
      text: "The platform's ability to generate questions from PDFs using AI is groundbreaking. It saves me countless hours while maintaining quality.",
      name: "Dr. Youssef Khalil",
      handle: "Physics Professor",
      avatar: "/assests/avatar-8.png"
    },
    {
      id: 9,
      text: "As a student, I love how Lrnflix adapts to my learning style. The AI tutor and personalized recommendations have made studying much more effective.",
      name: "Mariam Hassan",
      handle: "Business Student",
      avatar: "/assests/avatar-9.png"
    }
  ];

  const renderTestimonial = (testimonial: TestimonialData) => (
    <div key={testimonial.id} className="shadow-xl w-[310px] rounded-2xl p-8">
      <div className="font-medium pb-4 text-black">{testimonial.text}</div>
      <div className="flex items-center gap-3">
        <img src={testimonial.avatar} alt="Avatar" className="h-12 w-12" />
        <div>
          <div className="font-semibold text-black">{testimonial.name}</div>
          <div className="text-black">{testimonial.handle}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-20 bg-white">
      <div className="flex flex-col items-center px-28 pb-16">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl font-semibold border-slate-300/80">
          Testimonials
        </div>
        <div className="text-4xl lg:text-5xl pt-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          What our users say
        </div>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_top,transparent,black,transparent)] h-[750px] mb-12 md:mb-28 lg:mb-36">
        <motion.div
          animate={{
            translateY: "-50%",
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          <div className="flex items-center justify-center overflow-x-hidden pb-4 gap-4">
            <div className="hidden md:block">
              {renderTestimonial(testimonials[0])}
              <div className="my-6">{renderTestimonial(testimonials[1])}</div>
              {renderTestimonial(testimonials[2])}
            </div>

            <div>
              {renderTestimonial(testimonials[3])}
              <div className="my-6">{renderTestimonial(testimonials[4])}</div>
              {renderTestimonial(testimonials[5])}
            </div>

            <div className="hidden md:block">
              {renderTestimonial(testimonials[6])}
              {renderTestimonial(testimonials[7])}
              {renderTestimonial(testimonials[8])}
            </div>
          </div>

          <div className="flex items-center justify-center overflow-x-hidden gap-4">
            <div className="hidden md:block">
              {renderTestimonial(testimonials[0])}
              <div className="my-6">{renderTestimonial(testimonials[1])}</div>
              {renderTestimonial(testimonials[2])}
            </div>

            <div>
              {renderTestimonial(testimonials[3])}
              <div className="my-6">{renderTestimonial(testimonials[4])}</div>
              {renderTestimonial(testimonials[5])}
            </div>

            <div className="hidden md:block">
              {renderTestimonial(testimonials[6])}
              {renderTestimonial(testimonials[7])}
              {renderTestimonial(testimonials[8])}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;
