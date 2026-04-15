import React from 'react';
import HeroSection from '../components/HeroSection';
import OutroSection from '../components/OutroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAboutPage } from '../utils/useAboutPage';
import { useOutroSection } from '../utils/useOutroSection';

const About: React.FC = () => {
  const { aboutPageData, loading: aboutLoading, error: aboutError } = useAboutPage();
  const { outroData, loading: outroLoading, error: outroError } = useOutroSection();
  
  if (aboutLoading) {
    return (
      <main className="page page__about">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Loading about page content...</p>
        </div>
      </main>
    );
  }

  if (aboutError || !aboutPageData) {
    return (
      <main className="page page__about">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <ErrorMessage message={aboutError || "Failed to load about page content from Contentstack API"} />
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Please ensure your Contentstack API is configured correctly.
          </p>
        </div>
      </main>
    );
  }

  // Render page components dynamically from API
  const renderPageComponents = () => {
    if (!aboutPageData.page_components || aboutPageData.page_components.length === 0) {
      return null;
    }

    return aboutPageData.page_components.map((component: any, index: number) => {
      if (component.section_with_html_code) {
        const section = component.section_with_html_code;
        
        // Extract description text from rich text format
        let descriptionText = '';
        if (section.description && section.description.children) {
          descriptionText = section.description.children
            .map((child: any) => 
              child.children?.map((c: any) => c.text).join('') || ''
            )
            .join('\n');
        }

        return (
          <section key={index} className="page__section about-section" style={{
            padding: '3rem 1rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div className="about-section__container">
              {section.title && (
                <h2 className="about-section__title title" style={{
                  fontSize: '2.5rem',
                  color: '#8B4513',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  {section.title}
                </h2>
              )}
              
              {descriptionText && (
                <div className="about-section__description" style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  color: '#333',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  maxWidth: '800px',
                  margin: '0 auto 2rem auto'
                }}>
                  {descriptionText}
                </div>
              )}
              
              {section.html_code && (
                <div 
                  className="about-section__html-content"
                  style={{
                    textAlign: section.html_code_alignment?.toLowerCase() || 'center',
                    marginTop: '2rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: section.html_code }}
                />
              )}
            </div>
          </section>
        );
      }
      return null;
    });
  };
  
  return (
    <main className="page page__about">
      {/* Hero Banner */}
      <HeroSection
        title={aboutPageData.hero_banner?.banner_title || aboutPageData.title || "About Us"}
        subtitle={aboutPageData.hero_banner?.banner_subtitle}
        description={aboutPageData.hero_banner?.banner_description || ""}
        backgroundVideo={aboutPageData.hero_banner?.banner_image?.url || ""}
        buttonText={aboutPageData.hero_banner?.call_to_action?.title}
        buttonLink="/"
        isMainHero={false}
      />
      
      {/* Horizontal Scrolling Cards Banner */}
      {aboutPageData.reference_cards && aboutPageData.reference_cards.length > 0 && (
        <section className="about-cards-banner" style={{
          backgroundColor: '#faf8f5',
          padding: '3rem 0',
          overflow: 'hidden',
          borderTop: '1px solid #e8e5df',
          borderBottom: '1px solid #e8e5df'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#8B4513',
              textAlign: 'center',
              marginBottom: '2rem',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              What Grabo Is?
            </h2>
            
            {/* Horizontal Scrolling Container */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              paddingBottom: '1rem',
              scrollbarWidth: 'thin',
              scrollbarColor: '#8B4513 #e8e5df',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}>
              {aboutPageData.reference_cards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    minWidth: '500px',
                    maxWidth: '500px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 69, 19, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Card Image */}
                  <div style={{
                    width: '100%',
                    height: '300px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0'
                  }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/common/placeholder.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div style={{
                    padding: '2rem',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: '#2c2c2c',
                      marginBottom: '1rem',
                      fontFamily: "'Montserrat', sans-serif"
                    }}>
                      {card.title}
                    </h3>
                    
                    <p style={{
                      fontSize: '1rem',
                      color: '#666',
                      lineHeight: '1.8',
                      flex: '1',
                      fontFamily: "'Montserrat', sans-serif"
                    }}>
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Hint */}
            <p style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '0.9rem',
              marginTop: '1rem',
              fontStyle: 'italic'
            }}>
              ← Scroll to explore more →
            </p>
          </div>
          
          {/* Custom Scrollbar Styles */}
          <style>{`
            .about-cards-banner div::-webkit-scrollbar {
              height: 8px;
            }
            .about-cards-banner div::-webkit-scrollbar-track {
              background: #e8e5df;
              border-radius: 4px;
            }
            .about-cards-banner div::-webkit-scrollbar-thumb {
              background: #8B4513;
              border-radius: 4px;
            }
            .about-cards-banner div::-webkit-scrollbar-thumb:hover {
              background: #6d3410;
            }
          `}</style>
        </section>
      )}
      
      {/* Page Components */}
      {renderPageComponents()}
      
      {/* Outro Section */}
      <OutroSection 
        outroData={outroData}
        loading={outroLoading}
        error={outroError}
        className="outro outro_about"
      />
    </main>
  );
};

export default About;
