import { useState, useEffect, useCallback } from 'react';
import { AboutPageData, getAboutPageContent } from '../services/contentstackApi';

export const useAboutPage = () => {
  const [aboutPageData, setAboutPageData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAboutPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📄 Loading about page data from Contentstack...');
      
      const aboutContent = await getAboutPageContent();
      
      if (aboutContent) {
        console.log('✅ About page data loaded successfully:', aboutContent);
        setAboutPageData(aboutContent);
      } else {
        console.warn('⚠️ About content is null');
        throw new Error('Failed to load about page content from Contentstack');
      }
      
    } catch (err) {
      console.error('❌ Error loading about page data:', err);
      setError('Failed to load about page content. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAboutPageData();
  }, [loadAboutPageData]);

  return {
    aboutPageData,
    loading,
    error,
    refetch: loadAboutPageData
  };
};
