import { useState, useEffect, useCallback } from 'react';
import { 
  CartPageData, 
  EmptyCartStorySection,
  OrderSummaryData,
  getCartPageContent, 
  getEmptyCartStorySection,
  getOrderSummaryData
} from '../services/contentstackApi';

export const useCartPage = () => {
  const [cartPageData, setCartPageData] = useState<CartPageData | null>(null);
  const [emptyCartStory, setEmptyCartStory] = useState<EmptyCartStorySection | null>(null);
  const [orderSummaryData, setOrderSummaryData] = useState<OrderSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCartPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🛒 Loading cart page data from Contentstack...');
      
      // Fetch cart page content, empty cart story section, and order summary data
      const [cartContent, emptyCartStoryContent, orderSummary] = await Promise.all([
        getCartPageContent(),
        getEmptyCartStorySection(),
        getOrderSummaryData()
      ]);
      
      console.log('✅ Cart page data loaded successfully');
      console.log('📦 Full Cart content:', JSON.stringify(cartContent, null, 2));
      console.log('📖 Empty cart story:', JSON.stringify(emptyCartStoryContent, null, 2));
      console.log('📋 Order summary:', JSON.stringify(orderSummary, null, 2));
      
      if (cartContent) {
        console.log('✅ Setting cart page data:', cartContent);
        setCartPageData(cartContent);
      } else {
        console.warn('⚠️ Cart content is null');
      }

      if (emptyCartStoryContent) {
        console.log('✅ Setting empty cart story data:', emptyCartStoryContent);
        setEmptyCartStory(emptyCartStoryContent);
      } else {
        console.warn('⚠️ Empty cart story is null');
      }

      if (orderSummary) {
        console.log('✅ Setting order summary data:', orderSummary);
        setOrderSummaryData(orderSummary);
      } else {
        console.warn('⚠️ Order summary is null');
      }
      
    } catch (err) {
      console.error('❌ Error loading cart page data:', err);
      setError('Failed to load cart page content. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartPageData();
  }, [loadCartPageData]);

  return {
    cartPageData,
    emptyCartStory,
    orderSummaryData,
    loading,
    error,
    refetch: loadCartPageData
  };
};

