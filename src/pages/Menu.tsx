import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MenuCard from '../components/MenuCard';
import OutroSection from '../components/OutroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { MenuItem } from '../types';
import { useMenu } from '../utils/useMenu';
import { useMenuPage } from '../utils/useMenuPage';
import { useOutroSection } from '../utils/useOutroSection';

const Menu: React.FC = () => {
  const { menuItems, featuredSection, loading: menuLoading, error: menuError, refetch } = useMenu();
  const { menuPageData, loading: pageLoading, error: pageError } = useMenuPage();
  const { outroData, loading: outroLoading, error: outroError } = useOutroSection();
  
  const loading = menuLoading || pageLoading;
  const error = menuError || pageError;

  const handleOrderClick = (item: MenuItem) => {
    console.log('🛒 Order placed:', { id: item.id, title: item.title });
    // Alert removed - notification system handles user feedback
  };

  // Handle scrolling to anchor element on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && menuItems.length > 0) {
      // Remove the # from hash to get the element ID
      const elementId = hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        // Use setTimeout to ensure the element is rendered
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [menuItems, loading]); // Depend on menuItems so it runs after menu is loaded

  const renderMenuContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={refetch} />;
    }
    console.log("Menu Items", menuItems);

    return (
      <div className="menu-page__grid">
        {menuItems.map((item) => (
          <MenuCard 
            key={item.id} 
            item={item} 
            onOrderClick={handleOrderClick}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="page page__menu">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Loading menu page...</p>
        </div>
      </main>
    );
  }

  if (error || !menuPageData) {
    return (
      <main className="page page__menu">
        <ErrorMessage 
          message={error || "Failed to load menu page content from Contentstack API"} 
          onRetry={refetch} 
        />
      </main>
    );
  }

  return (
    <main className="page page__menu">
      <HeroSection
        title={menuPageData.hero_banner?.banner_title || menuPageData.title || ""}
        subtitle={menuPageData.hero_banner?.banner_subtitle}
        description={menuPageData.hero_banner?.banner_description || ""}
        backgroundImage={menuPageData.hero_banner?.banner_image?.url || ""}
        buttonText={menuPageData.hero_banner?.call_to_action?.title || "View Menu"}
        buttonLink={menuPageData.hero_banner?.call_to_action?.href || "#menu-items"}
        isMainHero={false}
      />
      
      {/* Featured Section - Shows when no personalization is active */}
      {featuredSection && (
        <section className="featured-section">
          <div className="featured-section__container">
            <div className="featured-section__header">
              <h2 className="featured-section__title">{featuredSection.title}</h2>
              <p className="featured-section__description">{featuredSection.description}</p>
            </div>
            <div className="featured-section__cards">
              {featuredSection.cards && featuredSection.cards.map((card: MenuItem) => (
                <MenuCard 
                  key={card.id} 
                  item={card} 
                  onOrderClick={handleOrderClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <section id="menu-items" className="page__menu menu-page">
        <div className="menu-page__container">
          {renderMenuContent()}
        </div>
      </section>

      <OutroSection 
        outroData={outroData}
        loading={outroLoading}
        error={outroError}
        className="outro outro_menu"
      />
    </main>
  );
};

export default Menu;
