import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import initPersonalizeSdk, { 
  getUserIdForPersonalization, 
  getVariantParam,
  addVariantParamToUrl,
  createPersonalizedRequest,
  savePersonalizeState,
  loadPersonalizeState,
  createPersonalizedResponse,
  setUserAttributes,
  getUserAttributes,
  getCoffeePreferenceAttribute
} from '../services/personalize';
import { useOrder } from './OrderContext';

interface PersonalizeContextType {
  personalizeSdk: any | null;
  isInitialized: boolean;
  error: string | null;
  userId: string | null;
  reinitialize: () => Promise<void>;
  getVariantParam: () => string;
  addVariantParamToUrl: (url: string) => string;
  createPersonalizedRequest: (url: string, options?: RequestInit) => Promise<Response>;
  createPersonalizedResponse: (response: Response) => Promise<Response>;
  saveState: () => Promise<void>;
  loadState: () => { userUid: string | null; manifestState: any };
  setUserAttributes: (attributes: Record<string, string>) => Promise<void>;
  getUserAttributes: () => Record<string, string>;
  setAudienceFromOrder: (items: Array<{ type?: string }>) => Promise<void>;
}

const PersonalizeContext = createContext<PersonalizeContextType | null>(null);

export const PersonalizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personalizeSdk, setPersonalizeSdk] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { state: orderState } = useOrder();

  const initialize = async () => {
    try {
      console.log('🚀 Initializing Contentstack Personalize...');
      setError(null);

      // Get user ID from order state or anonymous
      const currentUserId = getUserIdForPersonalization(orderState);
      setUserId(currentUserId);

      // Initialize the SDK
      const sdk = await initPersonalizeSdk(currentUserId);
      
      if (sdk) {
        setPersonalizeSdk(sdk);
        setIsInitialized(true);
        console.log('✅ Personalize Context ready');
      } else {
        setError('Failed to initialize Personalize SDK');
        console.warn('⚠️ Personalize SDK not initialized (check environment variables)');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error in PersonalizeContext:', err);
    }
  };

  const reinitialize = async () => {
    console.log('🔄 Reinitializing Personalize SDK...');
    await initialize();
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reinitialize when user places first order
  useEffect(() => {
    if (orderState?.orders && orderState.orders.length > 0 && isInitialized) {
      console.log('🔄 User placed order - reinitializing Personalize with user ID');
      reinitialize();
    }
  }, [orderState?.orders?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to set audience based on order items
  const setAudienceFromOrder = async (items: Array<{ type?: string }>) => {
    if (!personalizeSdk) {
      console.warn('⚠️ Personalize SDK not initialized');
      return;
    }

    try {
      // Determine coffee preference attribute from order items
      // Returns { attributeName, attributeValue } based on dominant type
      const { attributeName, attributeValue } = getCoffeePreferenceAttribute(items);
      
      console.log('🎯 Setting audience based on order:');
      console.log('   Order items:', items.map(i => i.type));
      console.log(`   Attribute to set: ${attributeName} = "${attributeValue}"`);

      // Set user attribute for audience targeting
      // Each coffee type has its own attribute (Hot Brew, Cold Brew, Cocoa Brew)
      await setUserAttributes(personalizeSdk, {
        [attributeName]: attributeValue
      });

      console.log(`✅ User assigned to audience via: ${attributeName} = "${attributeValue}"`);
      
      // Reinitialize to apply new audience assignment
      console.log('🔄 Reinitializing SDK to apply audience changes...');
      await reinitialize();
    } catch (error) {
      console.error('❌ Error setting audience from order:', error);
    }
  };

  return (
    <PersonalizeContext.Provider
      value={{
        personalizeSdk,
        isInitialized,
        error,
        userId,
        reinitialize,
        getVariantParam: () => getVariantParam(personalizeSdk),
        addVariantParamToUrl: (url: string) => addVariantParamToUrl(url, personalizeSdk),
        createPersonalizedRequest: (url: string, options?: RequestInit) => 
          createPersonalizedRequest(url, personalizeSdk, options),
        createPersonalizedResponse: (response: Response) => 
          createPersonalizedResponse(response, personalizeSdk),
        saveState: () => savePersonalizeState(personalizeSdk),
        loadState: loadPersonalizeState,
        setUserAttributes: (attributes: Record<string, string>) => 
          setUserAttributes(personalizeSdk, attributes),
        getUserAttributes,
        setAudienceFromOrder,
      }}
    >
      {children}
    </PersonalizeContext.Provider>
  );
};

export const usePersonalize = () => {
  const context = useContext(PersonalizeContext);
  if (!context) {
    throw new Error('usePersonalize must be used within a PersonalizeProvider');
  }
  return context;
};

