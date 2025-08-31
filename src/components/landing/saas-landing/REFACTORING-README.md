# SaasLanding Components

This folder contains the refactored components that were previously defined inline in the `SaasLanding.tsx` file.

## Structure

```
saas-landing/
├── index.ts                 # Export file for all components
├── types.ts                 # Type definitions and interfaces
├── LocalButton.tsx          # Local button component
├── TopLine.tsx              # Top banner line component
├── Header.tsx               # Navigation header component
├── MobileNavigation.tsx     # Mobile navigation overlay
├── Hero.tsx                 # Hero section component
├── BrandSlide.tsx           # Brand logo carousel
├── ProductShowcase.tsx      # Product showcase section
├── ProductCard.tsx          # Product feature cards
├── Testimonials.tsx         # User testimonials section
├── Pricing.tsx              # Pricing plans section
├── CTA.tsx                  # Call-to-action section
├── TopCourses.tsx           # Top courses carousel
├── InfiniteInstructors.tsx  # 3D instructor showcase
├── Footer.tsx               # Footer component
└── README.md                # This file
```

## Components

### Core Components
- **Header**: Main navigation with authentication and mobile menu
- **Hero**: Landing hero section with CTA buttons
- **Footer**: Site footer with links and social media

### Content Sections
- **BrandSlide**: Animated brand logo carousel
- **ProductShowcase**: Main product features with parallax effects
- **ProductCard**: Feature cards with animated geometric shapes
- **Testimonials**: User testimonials with infinite scroll
- **Pricing**: Pricing plans for different user types
- **CTA**: Call-to-action section with role-based buttons

### Data-Driven Components
- **TopCourses**: Horizontal course carousel with real data
- **InfiniteInstructors**: 3D instructor showcase with real data

### Utility Components
- **LocalButton**: Reusable button component
- **TopLine**: Top banner for announcements
- **MobileNavigation**: Mobile navigation overlay

## Usage

Import components from the main index file:

```tsx
import {
  Header,
  Hero,
  BrandSlide,
  ProductShowcase,
  // ... other components
} from './saas-landing';
```

## Features

- **Responsive Design**: All components are mobile-first and responsive
- **Animation**: Uses Framer Motion for smooth animations and parallax effects
- **Authentication**: Role-based content and navigation
- **Data Integration**: Real-time data from API queries
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized with React Query for data fetching

## Dependencies

- React 18+
- Framer Motion
- React Query
- React Router
- Redux Toolkit
- Tailwind CSS
- Lucide React Icons
- React Icons

## Notes

- All components maintain the exact same functionality as the original inline components
- The refactoring preserves all animations, interactions, and styling
- Components are now more maintainable and reusable
- Type safety is improved with dedicated type definitions
