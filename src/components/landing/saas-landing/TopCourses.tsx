import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FaPlay } from 'react-icons/fa';
import { getTopCourses } from '@/lib/queries';
import { CourseData } from './types';

// TopCourses Component
const TopCourses: React.FC = () => {
  const { data: courses, isLoading, isError } = useQuery<CourseData[]>({
    queryKey: ['topCourses'],
    queryFn: getTopCourses,
    initialData: [],
  });
  const navigate = useNavigate();
  const coursesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: coursesRef,
    offset: ["start start", "end end"],
  });

  // Horizontal scroll effect - courses move left as user scrolls down (faster movement)
  const translateX = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const translateXRight = useTransform(scrollYProgress, [0, 1], [0, 300]);

  if (isLoading) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Courses
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Discover Our Most Popular Courses
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-black">
            Loading amazing courses...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Courses
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Discover Our Most Popular Courses
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-red-600">
            Error loading courses. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={coursesRef} className="pt-20 bg-white relative overflow-hidden">
      {/* Premium Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #002499 1px, transparent 1px),
              linear-gradient(180deg, #002499 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 left-20 w-24 h-24 border border-blue-200/20 rotate-45 opacity-30"></div>
        <div className="absolute top-48 right-32 w-16 h-16 bg-blue-100/20 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-indigo-200/15 rotate-12 opacity-25"></div>
        <div className="absolute bottom-48 right-1/4 w-28 h-28 bg-purple-100/15 transform rotate-45 opacity-30"></div>
        
        {/* Large Pattern Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/8 rounded-full blur-3xl"></div>
        
        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/15 rounded-full blur-2xl"
          animate={{
            y: [10, -10, 10],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px] relative z-10">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
          Top Courses
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Discover Our Most Popular Courses
        </div>
        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Join thousands of learners who have already transformed their skills with our most popular courses
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative pb-20">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Carousel */}
        <motion.div
          className="flex gap-8 px-28"
          style={{ translateX }}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-white shadow-3xl border-2 border-gray-300 overflow-hidden min-w-[420px] max-w-[420px] cursor-pointer"
            >
              {/* Premium Thumbnail Section */}
              <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <FaPlay className="text-5xl text-gray-400" />
                  </div>
                )}
                
                {/* Premium overlay with sophisticated gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                
                {/* Premium badge with enhanced styling */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-3 text-sm font-bold shadow-xl border border-gray-300">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
              </div>

              {/* Hierarchical Content Section */}
              <div className="p-10 bg-white">
                {/* Course Title - Primary Hierarchy */}
                <h3 className="text-3xl font-bold text-gray-900 mb-6 line-clamp-2 leading-tight tracking-tight">
                  {course.title}
                </h3>

                {/* Instructor Name - Secondary Hierarchy */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl">
                    {course.profiles?.full_name?.[0] || 'I'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Instructor
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {course.profiles?.full_name || 'Course Instructor'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* View All Courses CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.4 }}
        className="flex justify-center pb-16 relative z-10"
      >
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/courses')}
        >
          View All Courses
        </Button>
      </motion.div>
    </div>
  );
};

export default TopCourses;
