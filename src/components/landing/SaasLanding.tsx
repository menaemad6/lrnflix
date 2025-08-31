import React from 'react';
import IphoneShowcaseSection from '../home/IphoneShowcaseSection';
import PrismHero from './PrismHero';
import PoliciesModal from './PoliciesModal';
import {
  Header,
  Hero,
  BrandSlide,
  ProductShowcase,
  InfiniteInstructors,
  TopCourses,
  ProductCard,
  Testimonials,
  Pricing,
  CTA,
  Footer
} from './saas-landing';

// Main Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white gap-0">
      <Header />
      {/* <Hero /> */}
      <PrismHero />
      <BrandSlide />
      <ProductShowcase />
      <InfiniteInstructors />
      <TopCourses />
      <ProductCard />
      {/* <IphoneShowcaseSection leftTextTop="Transform" leftTextBottom="Education." /> */}
      <Testimonials />
      {/* <Pricing /> */}
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
