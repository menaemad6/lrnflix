import React from 'react';
import { motion } from 'framer-motion';
import { TestimonialData } from './types';

// Testimonials Component
const Testimonials: React.FC = () => {
  const testimonials: TestimonialData[] = [
    {
      id: 1,
      text: "Lrnflix has transformed how I teach physics. The AI explanations help me break down complex concepts for my students, and the practice questions are perfect for testing their understanding.",
      name: "Dr. Aisha Hassan",
      handle: "Physics Teacher",
      avatar: "/assests/avatar-1.png"
    },
    {
      id: 2,
      text: "My students love the competitive quizzes! They're actually excited to study math now. The platform makes complex topics like calculus and trigonometry much easier to grasp.",
      name: "Sarah Mahmoud",
      handle: "Mathematics Teacher",
      avatar: "/assests/avatar-6.png"
    },
    {
      id: 3,
      text: "I was failing chemistry until I found Lrnflix. The AI tutor breaks down reactions step by step, and the visual explanations make everything click. My grades improved from 60% to 95%!",
      name: "Omar El-Sayed",
      handle: "Chemistry Student",
      avatar: "/assests/avatar-3.png"
    },
    {
      id: 4,
      text: "As an Arabic teacher, I appreciate how the platform adapts to different learning styles. The AI generates questions that actually challenge my students' critical thinking skills.",
      name: "Ahmed Ali",
      handle: "Arabic Language Teacher",
      avatar: "/assests/avatar-7.png"
    },
    {
      id: 5,
      text: "The biology section is incredible! Complex topics like genetics and human anatomy become simple with the interactive diagrams and AI explanations. Perfect for my students.",
      name: "Dr. Karim Mostafa",
      handle: "Biology Teacher",
      avatar: "/assests/avatar-2.png"
    },
    {
      id: 6,
      text: "English was my weakest subject, but Lrnflix's AI tutor helped me understand grammar rules and improve my vocabulary. I went from barely passing to scoring 90% in my final exams.",
      name: "Layla Ahmed",
      handle: "English Student",
      avatar: "/assests/avatar-5.png"
    },
    {
      id: 7,
      text: "The logic and reasoning questions in the philosophy section are exactly what my students need. It teaches critical thinking that helps in all subjects, not just philosophy.",
      name: "Prof. Hassan Ibrahim",
      handle: "Philosophy & Logic Teacher",
      avatar: "/assests/avatar-4.png"
    },
    {
      id: 8,
      text: "History lessons become engaging with Lrnflix! The AI creates scenarios that make my students think about cause and effect, not just memorize dates. Perfect for developing analytical skills.",
      name: "Dr. Yasmin Khalil",
      handle: "History Teacher",
      avatar: "/assests/avatar-8.png"
    },
    {
      id: 9,
      text: "I struggled with geography maps and climate patterns, but the interactive lessons and AI-generated questions helped me understand spatial relationships and environmental factors.",
      name: "Mohammed Hassan",
      handle: "Geography Student",
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
