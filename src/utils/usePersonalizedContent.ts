import { useEffect, useState, useCallback } from 'react';
import { usePersonalize } from '../contexts/PersonalizeContext';

/**
 * Custom hook to fetch personalized content from Contentstack
 * Automatically adds variant parameters from Personalize SDK
 * 
 * Example usage:
 * const { data, loading, error } = usePersonalizedContent('https://cdn.contentstack.io/...');
 */
export const usePersonalizedContent = <T = any>(url: string, dependencies: any[] = []) => {
  const { createPersonalizedRequest, isInitialized } = usePersonalize();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPersonalizedContent = useCallback(async () => {
    if (!url || !isInitialized) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Fetching personalized content from:', url);

      // Use the personalized request function
      const response = await createPersonalizedRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      console.log('✅ Personalized content loaded:', result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('❌ Error fetching personalized content:', error);
    } finally {
      setLoading(false);
    }
  }, [url, isInitialized, createPersonalizedRequest]);

  useEffect(() => {
    fetchPersonalizedContent();
  }, [fetchPersonalizedContent, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchPersonalizedContent };
};

/**
 * Helper function to create personalized Contentstack API URL
 * Adds variant parameter to existing Contentstack URLs
 * 
 * Example:
 * const personalizedUrl = getPersonalizedContentstackUrl(
 *   'https://cdn.contentstack.io/v3/content_types/page/entries/blt123',
 *   personalizeSdk
 * );
 */
export const getPersonalizedContentstackUrl = (
  baseUrl: string,
  apiKey: string,
  accessToken: string,
  personalizeSdk: any
): string => {
  try {
    if (!personalizeSdk) {
      return baseUrl;
    }

    const parsedUrl = new URL(baseUrl);
    
    // Add Contentstack credentials if not already present
    if (!parsedUrl.searchParams.has('api_key')) {
      parsedUrl.searchParams.set('api_key', apiKey);
    }
    if (!parsedUrl.searchParams.has('access_token')) {
      parsedUrl.searchParams.set('access_token', accessToken);
    }

    // Get variant parameter from Personalize SDK
    const variantParam = personalizeSdk.getVariantParam?.();
    
    if (variantParam) {
      const variantQueryParam = personalizeSdk.VARIANT_QUERY_PARAM || 'variant';
      parsedUrl.searchParams.set(variantQueryParam, variantParam);
      console.log('🎯 Added personalization variant to URL:', variantParam);
    }

    return parsedUrl.toString();
  } catch (error) {
    console.error('❌ Error creating personalized URL:', error);
    return baseUrl;
  }
};

/**
 * Example: How to fetch personalized featured section
 * This demonstrates the Edge Function pattern adapted for React
 */
export const fetchPersonalizedFeaturedSection = async (
  personalizeSdk: any,
  apiKey: string,
  accessToken: string,
  sectionUid: string
): Promise<any> => {
  try {
    // Base URL for Contentstack API
    const baseUrl = `https://cdn.contentstack.io/v3/content_types/featured_coffee_section/entries/${sectionUid}`;
    
    // Create URL object
    const parsedUrl = new URL(baseUrl);
    
    // Add Contentstack credentials
    parsedUrl.searchParams.set('api_key', apiKey);
    parsedUrl.searchParams.set('access_token', accessToken);
    
    // Get the variant parameter from the SDK
    const variantParam = personalizeSdk.getVariantParam?.();
    
    if (variantParam) {
      // Set the variant parameter as a query param in the URL
      const variantQueryParam = personalizeSdk.VARIANT_QUERY_PARAM || 'variant';
      parsedUrl.searchParams.set(variantQueryParam, variantParam);
      console.log('🎯 Personalize variant added to request:', variantParam);
    }
    
    console.log('📡 Fetching personalized featured section:', parsedUrl.toString());
    
    // Make the request with the modified URL
    const response = await fetch(parsedUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Personalized featured section loaded');
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching personalized featured section:', error);
    throw error;
  }
};

