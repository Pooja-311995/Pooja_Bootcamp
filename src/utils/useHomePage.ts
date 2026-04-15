import { useState, useEffect, useCallback } from 'react';
import { HomePageData, HeroBanner, getHomePageContent, getHeroBanner } from '../services/contentstackApi';
import { usePersonalize } from '../contexts/PersonalizeContext';
import { useOrder } from '../contexts/OrderContext';

export const useHomePage = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getVariantParam, isInitialized: personalizeInitialized } = usePersonalize();
  const { getUserPreference } = useOrder();

  const loadHomePageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏠 Loading home page data from Contentstack...');
      
      // Get variant parameter from Personalize SDK (if available)
      let variantParam: string | undefined = undefined;
      if (personalizeInitialized) {
        variantParam = getVariantParam();
        console.log('🎯 Variant parameter for Home page:', variantParam || 'none');
      } else {
        console.log('⚠️ Personalize SDK not initialized - loading without personalization');
      }
      
      // Get user preference for personalization
      const userPreference = getUserPreference();
      console.log('🎯 User preference for personalization:', userPreference || 'none');
      
      // getHomePageContent handles everything including featured section
      // Pass variantParam AND userPreference for personalization
      const [homeContent, bannerContent] = await Promise.all([
        getHomePageContent(variantParam, userPreference),
        getHeroBanner(variantParam)
      ]);
      
      // Log what we got for debugging
      if (homeContent && homeContent.services_section) {
        console.log('✅ Home page services_section loaded:', {
          title: homeContent.services_section.title_h2,
          cardsCount: homeContent.services_section.buckets?.length || 0,
          cards: homeContent.services_section.buckets?.map((b: any) => b.title_h3)
        });
      } else {
        console.warn('⚠️  No services_section found in home content');
      }
      
      setHomeData(homeContent);
      setHeroBanner(bannerContent);
      
      console.log('✅ Home page data loaded successfully with personalization');
      console.log('Home content:', homeContent);
      console.log('Hero banner:', bannerContent);
      
    } catch (err) {
      console.error('❌ Error loading home page data:', err);
      setError('Failed to load home page content. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [getVariantParam, personalizeInitialized, getUserPreference]); // Dependencies for personalization

  useEffect(() => {
    loadHomePageData();
  }, [loadHomePageData]);

  // Function to refresh data when user preference changes (after first order)
  const refreshWithPersonalization = useCallback(() => {
    console.log('🔄 Refreshing home page with updated personalization...');
    loadHomePageData();
  }, [loadHomePageData]);

  return {
    homeData,
    heroBanner,
    loading,
    error,
    refetch: loadHomePageData,
    refreshWithPersonalization
  };
};
