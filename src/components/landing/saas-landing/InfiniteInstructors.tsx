import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getFeaturedInstructors } from '@/lib/queries';
import InfiniteMenu from '../../react-bits/InfiniteMenu/InfiniteMenu';

// Infinite Instructors Component
const InfiniteInstructors: React.FC = () => {
  const navigate = useNavigate();
  const { data: instructors, isLoading, isError } = useQuery({
    queryKey: ['featuredInstructors'],
    queryFn: getFeaturedInstructors,
  });

  if (isLoading) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Interactive Instructors
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Explore Our Instructors in 3D
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-black">
            Loading amazing instructors...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !instructors) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Interactive Instructors
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Explore Our Instructors in 3D
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-red-600">
            Error loading instructors. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Transform instructors data to match InfiniteMenu format - EXACTLY like TopInstructors
  const menuItems = instructors.map((instructor, index) => {
    // Use the EXACT same image handling as TopInstructors component
    let imageUrl = instructor.profile_image_url;
    
    // If no profile image, use fallback avatar (same as TopInstructors)
    if (!imageUrl) {
      const avatarIndex = (index % 9) + 1;
      imageUrl = `/assests/avatar-${avatarIndex}.png`;
    }
    
    // Ensure the image URL is absolute (fix for InfiniteMenu)
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = `/${imageUrl}`;
    }
    
    // Debug logging
    console.log(`Instructor ${index}:`, {
      name: instructor.display_name,
      profileImage: instructor.profile_image_url,
      finalImage: imageUrl,
      hasImage: !!instructor.profile_image_url,
      isAbsolute: imageUrl?.startsWith('/') || imageUrl?.startsWith('http')
    });
    
    return {
      image: imageUrl,
      link: `/teachers/${instructor.slug}`,
      title: instructor.display_name || 'Instructor',
      description: instructor.specialization || 'Expert Educator',
      fallbackAvatar: `/assests/avatar-${(index % 9) + 1}.png` // Add fallback avatar path
    };
  });

  console.log('Final menuItems with images:', menuItems.map(item => ({ title: item.title, image: item.image })));

  console.log('Final menuItems:', menuItems);

  // Fallback items if no instructors
  if (menuItems.length === 0) {
    const fallbackItems = [
      {
        image: '/assests/avatar-1.png',
        link: '/teachers',
        title: 'Expert Instructors',
        description: 'Discover our amazing teachers'
      },
      {
        image: '/assests/avatar-2.png',
        link: '/teachers',
        title: 'Professional Educators',
        description: 'Learn from the best in their fields'
      },
      {
        image: '/assests/avatar-3.png',
        link: '/teachers',
        title: 'Certified Teachers',
        description: 'Quality education guaranteed'
      }
    ];
    return (
      <div className="pt-20 bg-white relative overflow-hidden">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px] relative z-10">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Interactive Instructors
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Explore Our Instructors in 3D
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-black">
            Interact with our expert instructors in an immersive 3D experience. 
            Click and drag to explore, and discover the perfect teacher for your learning journey.
          </div>
        </div>

        {/* Infinite Menu Container - Responsive Height */}
        <div className="relative w-full h-[600px] md:h-screen">
          <InfiniteMenu items={fallbackItems} />
        </div>

        {/* View All Instructors CTA */}
        <div className="flex justify-center pb-16 relative z-10 mt-4">
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/teachers')}
          >
            View All Instructors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white relative overflow-hidden">
      {/* Clean white background - patterns removed */}

      <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px] relative z-10">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
          Interactive Instructors
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Explore Our Instructors in 3D
        </div>
        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Interact with our expert instructors in an immersive 3D experience. 
          Click and drag to explore, and discover the perfect teacher for your learning journey.
        </div>
      </div>

      {/* Infinite Menu Container - Responsive Height */}
      <div className="relative w-full h-[600px] md:h-screen">
        <InfiniteMenu items={menuItems} />
      </div>

      {/* View All Instructors CTA */}
      <div className="flex justify-center pb-16 relative z-10 mt-6">
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/teachers')}
        >
          View All Instructors
        </Button>
      </div>
    </div>
  );
};

export default InfiniteInstructors;
