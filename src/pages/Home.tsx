import React from 'react';
import HeroSection from '../components/HeroSection';
import OutroSection from '../components/OutroSection';
import MenuCard from '../components/MenuCard';
import { useHomePage } from '../utils/useHomePage';
import { useOutroSection } from '../utils/useOutroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
const Home: React.FC = () => {
  const { homeData, heroBanner, loading, error, refreshWithPersonalization } = useHomePage();
  const { outroData, loading: outroLoading, error: outroError } = useOutroSection();

  // Check if home page needs to be refreshed with personalization
  React.useEffect(() => {
    const shouldRefresh = localStorage.getItem('grabo_refresh_home');
    const userPreference = localStorage.getItem('grabo_user_preference');
    
    if (shouldRefresh === 'true' && userPreference) {
      console.log('🔄 Refreshing home page with personalization for preference:', userPreference);
      refreshWithPersonalization();
      
      // Clear the refresh flag
      localStorage.removeItem('grabo_refresh_home');
      localStorage.removeItem('grabo_user_preference');
    }
  }, [refreshWithPersonalization]);

  if (loading) {
    return (
      <main className="page">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Loading home page content...</p>
        </div>
      </main>
    );
  }

  if (error || !homeData) {
    return (
      <main className="page">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <ErrorMessage message={error || "Failed to load home page content from Contentstack API"} />
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Please ensure your Contentstack API is configured correctly.
          </p>
        </div>
      </main>
    );
  }

  // Use dynamic content from Contentstack API (no fallbacks)
  const heroTitle = heroBanner?.banner_title || homeData.hero_banner?.banner_title || "";
  const heroSubtitle = heroBanner?.banner_subtitle || homeData.hero_banner?.banner_subtitle || "";
  const heroDescription = heroBanner?.banner_description || homeData.hero_banner?.banner_description || "";
  const heroButtonText = heroBanner?.call_to_action?.title || homeData.hero_banner?.call_to_action?.title || "";
  const heroButtonLink = heroBanner?.call_to_action?.href || homeData.hero_banner?.call_to_action?.href || "";
  const heroBackgroundVideo = heroBanner?.banner_image?.url || homeData.hero_banner?.banner_image?.url || "";

  // Debug logging
  console.log('🔍 Hero Data Debug:');
  console.log('heroBanner:', heroBanner);
  console.log('homeData?.hero_banner:', homeData?.hero_banner);
  console.log('Final heroTitle:', heroTitle);
  console.log('Final heroDescription:', heroDescription);
  console.log('📖 Story Section Debug:');
  console.log('homeData?.about_section:', homeData?.about_section);
  console.log('📸 Full Image Object:', homeData?.about_section?.image);
  console.log('📸 Image URL:', homeData?.about_section?.image?.url);
  console.log('📝 Title:', homeData?.about_section?.title_h2);
  console.log('📝 Description Length:', homeData?.about_section?.description?.length);
  console.log('📝 CTA Label:', homeData?.about_section?.cta_label);
  console.log('🔍 Has Image URL?', !!homeData?.about_section?.image?.url);


  return (
    <main className="page">
      <HeroSection
        subtitle={heroSubtitle}
        title={heroTitle}
        description={heroDescription}
        buttonText={heroButtonText}
        buttonLink={heroButtonLink}
        backgroundVideo={heroBackgroundVideo}
        isMainHero={true}
      />
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
          
          .about__text p {
            margin-bottom: 0.9rem;
            text-align: justify;
            line-height: 1.85;
          }
          .about__text strong, .about__text b {
            color: #8B4513;
            font-weight: 800;
            font-size: 1.12em;
          }
          .about__text br {
            display: block;
            content: "";
            margin: 0.4rem 0;
          }
        `}
      </style>

      <section className="page__about about" style={{
        padding: '4.5rem 2rem',
        backgroundColor: '#faf8f5',
        margin: '2rem 0'
      }}>
        <div className="about__container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '3.5rem'
        }}>
          <h2 className="about__title title" style={{
            fontSize: '2.8rem',
            fontWeight: '900',
            color: '#8B4513',
            marginBottom: '0',
            textAlign: 'center',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '2px',
            textTransform: 'none',
            lineHeight: '1.3'
          }}>
            {homeData.about_section?.title_h2 || ""}
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4.5rem',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            margin: '0 auto',
            width: '100%',
            maxWidth: '1300px'
          }}>
            {homeData.about_section?.image?.url && (
              <div className="about__image" style={{
                flex: '0 0 42%',
                maxWidth: '42%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <img 
                  src={homeData.about_section.image.url} 
                  alt={homeData.about_section.image.title || "About GRABO"}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(139, 69, 19, 0.18)',
                    border: '3px solid #ffffff',
                    backgroundColor: '#ffffff',
                    display: 'block',
                    padding: '1.5rem'
                  }}
                  onLoad={() => console.log('✅ Image loaded successfully!')}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', homeData.about_section?.image?.url);
                  }}
                />
              </div>
            )}
            
            <div className="about__content" style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '1.5rem 2rem 1.5rem 1rem'
            }}>
              {homeData.about_section?.description ? (
                <div 
                  className="about__text"
                  style={{
                    fontSize: '1.15rem',
                    lineHeight: '1.9',
                    color: '#2c2c2c',
                    textAlign: 'justify',
                    fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
                    fontWeight: '500',
                    letterSpacing: '0.4px'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: homeData.about_section.description
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.85',
                  color: '#999',
                  textAlign: 'center',
                  fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
                  padding: '2rem'
                }}>
                  No content available. Please check Contentstack configuration.
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginTop: '0.5rem'
          }}>
            {(homeData.about_section?.cta_label || homeData.about_section?.call_to_action?.title) && (
              <button 
                onClick={() => {
                  const servicesSection = document.querySelector('.page__services');
                  if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="about__button button button-coffee"
                style={{
                  display: 'inline-block',
                  padding: '1.1rem 3rem',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  backgroundColor: '#8B4513',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  boxShadow: '0 6px 20px rgba(139, 69, 19, 0.35)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6d3410';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8B4513';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.35)';
                }}
              >
                {homeData.about_section.cta_label || homeData.about_section.call_to_action?.title || "Explore Menu"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="page__services services">
        <div className="services__container">
          <h2 className="services__title title">
            {homeData.services_section?.title_h2 || ""}
          </h2>
          <div className="services__text">
            {homeData.services_section?.description || ""}
          </div>
          <div className="services__row" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {homeData.services_section?.buckets && homeData.services_section.buckets.length > 0 ? (
              homeData.services_section.buckets.map((service: any, index: number) => {
                // Convert service data to MenuItem format for MenuCard
                const menuItem = {
                  id: service.uid || `service-${index}`,
                  title: service.title_h3 || "Coffee",
                  description: service.description || "Delicious coffee",
                  price: service.price ? `₹${service.price}` : "₹99",
                  image: service.icon?.url || '/assets/images/common/placeholder.jpg',
                  type: service.type || 'default'  // ← ADD TYPE FIELD!
                };

                return (
                  <div key={service.uid || index} style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <MenuCard 
                      item={menuItem}
                    />
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                <p>No services available. Please check your Contentstack configuration.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="page__testimonial testimonial">
        <div className="testimonial__container">
          <h3 className="testiomonial__caption">
            {homeData.testimonial_section?.caption || ""}
          </h3>
          <h2 className="testimonial__title title">
            {homeData.testimonial_section?.title || ""}
          </h2>
          <div className="testimonial__item item-testimonial">
            <div className="item-testimonial__image">
              <img 
                src={homeData.testimonial_section?.user_image?.url || ""} 
                alt={homeData.testimonial_section?.user_name || "customer"} 
              />
            </div>
            <h4 className="item-testimonial__title">
              {homeData.testimonial_section?.user_name || ""}
            </h4>
            <div className="item-testimonial__caption">
              {homeData.testimonial_section?.user_title || ""}
            </div>
          </div>
        </div>
      </section>

      <OutroSection 
        outroData={outroData}
        loading={outroLoading}
        error={outroError}
        className="outro outro_home"
      />

    </main>
  );
};

export default Home;
