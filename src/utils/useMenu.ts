import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import { getMenuItems, getDefaultFeaturedSection } from '../services/contentstackApi';
import { usePersonalize } from '../contexts/PersonalizeContext';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [featuredSection, setFeaturedSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getVariantParam, isInitialized: personalizeInitialized, getUserAttributes } = usePersonalize();

  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get variant parameter from Personalize SDK (if available)
      let variantParam: string | undefined = undefined;
      let hasPersonalization = false;
      
      if (personalizeInitialized) {
        variantParam = getVariantParam();
        const userAttributes = getUserAttributes();
        hasPersonalization = !!variantParam;
        
        console.log('🔄 Loading menu from Contentstack REST API...');
        console.log('🎯 Variant parameter for Menu:', variantParam || 'none');
        console.log('🎯 User attributes:', userAttributes);
      } else {
        console.log('🔄 Loading menu from Contentstack REST API (without personalization)...');
      }
      
      // Fetch menu items and default featured section in parallel
      const [items, featured] = await Promise.all([
        getMenuItems(variantParam),
        !hasPersonalization ? getDefaultFeaturedSection() : Promise.resolve(null)
      ]);
      
      if (items && items.length > 0) {
        setMenuItems(items);
        
        if (hasPersonalization) {
          console.log('✅ Personalized menu items loaded successfully:', items);
          console.log('🎯 Menu personalized based on user audience');
          setFeaturedSection(null); // Don't show default featured section when personalized
        } else {
          console.log('✅ Menu items loaded successfully:', items);
          if (featured) {
            console.log('🌟 Default featured section loaded:', featured.title);
            setFeaturedSection(featured);
          }
        }
      } else {
        console.error('❌ No menu items returned from API');
        throw new Error('No menu items available from Contentstack API');
      }
    } catch (err) {
      console.error('❌ Error loading menu:', err);
      setError('Failed to load menu items from Contentstack API. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
    // personalizeInitialized drives behavior inside; context exposes new function
    // identities each render, so listing them would recreate this callback every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: mount + refetch/storage only
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Listen for audience changes and reload menu
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cs_personalize_user_attributes') {
        console.log('🔄 User attributes changed - reloading menu...');
        loadMenuItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadMenuItems]);

  return {
    menuItems,
    featuredSection,
    loading,
    error,
    refetch: loadMenuItems
  };
};
