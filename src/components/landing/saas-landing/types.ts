// Type definitions for SaasLanding components
export interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export interface TestimonialData {
  id: number;
  text: string;
  name: string;
  handle: string;
  avatar: string;
}

export interface CourseData {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  price: number;
  profiles?: {
    full_name: string;
  };
  enrollments?: Array<{
    count: number;
  }>;
}
