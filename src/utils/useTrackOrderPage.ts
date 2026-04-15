import { useState, useEffect, useCallback } from 'react';
import { TrackOrderPageData, getTrackOrderPageContent } from '../services/contentstackApi';

export const useTrackOrderPage = () => {
  const [trackOrderPageData, setTrackOrderPageData] = useState<TrackOrderPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrackOrderPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📦 Loading track order page data from Contentstack...');
      
      const trackOrderContent = await getTrackOrderPageContent();
      
      if (trackOrderContent) {
        console.log('✅ Track order page data loaded successfully:', trackOrderContent);
        setTrackOrderPageData(trackOrderContent);
      } else {
        console.warn('⚠️ Track order content is null');
        throw new Error('Failed to load track order page content from Contentstack');
      }
      
    } catch (err) {
      console.error('❌ Error loading track order page data:', err);
      setError('Failed to load track order page content. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackOrderPageData();
  }, [loadTrackOrderPageData]);

  return {
    trackOrderPageData,
    loading,
    error,
    refetch: loadTrackOrderPageData
  };
};
