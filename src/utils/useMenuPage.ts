import { useState, useEffect, useCallback } from 'react';
import { MenuPageData, getMenuPageContent } from '../services/contentstackApi';

export const useMenuPage = () => {
  const [menuPageData, setMenuPageData] = useState<MenuPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading menu page data from Contentstack...');
      
      const menuContent = await getMenuPageContent();
      
      if (menuContent) {
        console.log('✅ Menu page data loaded successfully:', menuContent);
        setMenuPageData(menuContent);
      } else {
        console.warn('⚠️ Menu content is null');
        throw new Error('Failed to load menu page content from Contentstack');
      }
      
    } catch (err) {
      console.error('❌ Error loading menu page data:', err);
      setError('Failed to load menu page content. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuPageData();
  }, [loadMenuPageData]);

  return {
    menuPageData,
    loading,
    error,
    refetch: loadMenuPageData
  };
};
