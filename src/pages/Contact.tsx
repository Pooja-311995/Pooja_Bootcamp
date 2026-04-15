import React from 'react';
import HeroSection from '../components/HeroSection';
import OutroSection from '../components/OutroSection';
import { useOutroSection } from '../utils/useOutroSection';

const Contact: React.FC = () => {
  const { outroData, loading, error } = useOutroSection();
  
  return (
    <main className="page">
      <HeroSection
        title="Contact"
        description="Subheading: Craft a compelling subheading that sparks curiosity."
        backgroundImage="/assets/images/contact/background_placeholder.png"
      />
      
      <OutroSection 
        outroData={outroData}
        loading={loading}
        error={error}
        className="outro outro_contact"
      />
    </main>
  );
};

export default Contact;
