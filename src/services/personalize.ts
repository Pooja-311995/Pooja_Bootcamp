import Personalize from '@contentstack/personalize-edge-sdk';   

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate or retrieve anonymous user ID
 */
const generateAnonymousId = (): string => {
  const STORAGE_KEY = 'grabo_anonymous_user_id';
  
  // Check if we already have an anonymous ID
  let anonymousId = localStorage.getItem(STORAGE_KEY);
  
  if (!anonymousId) {
    // Generate new anonymous ID
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, anonymousId);
    console.log('🆔 Generated new anonymous user ID:', anonymousId);
  } else {
    console.log('🆔 Retrieved existing anonymous user ID:', anonymousId);
  }
  
  return anonymousId;
};

/**
 * Load Personalize state from cookies/localStorage
 * @returns Saved state object
 */
export const loadPersonalizeState = (): { userUid: string | null; manifestState: any } => {
  try {
    const userUid = localStorage.getItem('cs_personalize_user_uid');
    const manifestStateStr = localStorage.getItem('cs_personalize_manifest_state');
    const manifestState = manifestStateStr ? JSON.parse(manifestStateStr) : null;
    
    if (userUid) {
      console.log('📂 Loaded Personalize user UID from localStorage:', userUid);
    }
    
    return { userUid, manifestState };
  } catch (error) {
    console.error('❌ Error loading Personalize state:', error);
    return { userUid: null, manifestState: null };
  }
};

/**
 * Save Personalize state to cookies/localStorage
 * Adapts addStateToResponse() for client-side React
 * @param personalizeSdk - Initialized Personalize SDK instance
 */
export const savePersonalizeState = async (personalizeSdk: any): Promise<void> => {
  try {
    if (!personalizeSdk) {
      return;
    }

    // Get state from SDK (if available)
    const userUid = personalizeSdk.getUserUid?.() || generateAnonymousId();
    const manifestState = personalizeSdk.getManifestState?.() || null;
    
    // Store in localStorage (browser equivalent of cookies)
    if (userUid) {
      localStorage.setItem('cs_personalize_user_uid', userUid);
      console.log('💾 Saved Personalize user UID to localStorage:', userUid);
    }
    
    if (manifestState) {
      localStorage.setItem('cs_personalize_manifest_state', JSON.stringify(manifestState));
      console.log('💾 Saved Personalize manifest state to localStorage');
    }

    // Also try to set cookies if addStateToResponse is available
    // This would work if running in a service worker or similar context
    if (typeof personalizeSdk.addStateToResponse === 'function') {
      console.log('🍪 SDK supports addStateToResponse - attempting to set cookies');
      // Note: This may not work in pure client-side context
      // but we'll try anyway for compatibility
    }
  } catch (error) {
    console.error('❌ Error saving Personalize state:', error);
  }
};

// ==================== SDK INITIALIZATION ====================

/**
 * Initialize Contentstack Personalize SDK
 * Loads saved state and initializes with proper context
 * @param userId - Optional user ID for personalization
 * @returns Initialized Personalize SDK instance
 */
const initPersonalizeSdk = async (userId?: string) => {
  try {
    // Get project UID from environment variables
    const projectUid = process.env.REACT_APP_CONTENTSTACK_PERSONALIZE_PROJECT_UID || '';
    
    if (!projectUid) {
      console.warn('⚠️ REACT_APP_CONTENTSTACK_PERSONALIZE_PROJECT_UID is not set');
      return null;
    }

    // Load saved state (user UID and manifest)
    const savedState = loadPersonalizeState();
    
    // Use saved user UID if available, otherwise use provided userId or generate new
    const effectiveUserId = savedState.userUid || userId || generateAnonymousId();

    // Set custom edge API URL if provided
    const edgeApiUrl = process.env.REACT_APP_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
    if (edgeApiUrl) {
      Personalize.setEdgeApiUrl(edgeApiUrl);
      console.log('🔗 Personalize Edge API URL set:', edgeApiUrl);
    }

    console.log('🎯 Initializing Contentstack Personalize SDK...');
    console.log('📦 Project UID:', projectUid);
    console.log('👤 User ID:', effectiveUserId);
    if (savedState.userUid) {
      console.log('♻️  Using saved user UID from previous session');
    }

    // SDK expects Fetch-style Request: `headers` must be a Headers instance (`.get()`), not a plain object.
    const headers = new Headers();
    headers.set('user-agent', navigator.userAgent);
    headers.set('accept-language', navigator.language);

    const requestContext = {
      url: window.location.href,
      headers,
      method: 'GET',
    };

    const personalizeSdk = await Personalize.init(projectUid, {
      userId: effectiveUserId,
      request: requestContext as any,
    });

    console.log('✅ Personalize SDK initialized successfully');
    console.log('🔍 SDK instance details:');
    console.log('   Type:', typeof personalizeSdk);
    console.log('   Has getVariantParam:', typeof personalizeSdk.getVariantParam);
    console.log('   Has setAttribute:', typeof (personalizeSdk as any).setAttribute);
    console.log('   Has setAttributes:', typeof (personalizeSdk as any).setAttributes);
    
    // Check initial manifest
    if ((personalizeSdk as any)._manifest) {
      console.log('   Initial manifest:', (personalizeSdk as any)._manifest);
    } else {
      console.log('   No initial manifest (normal for first init)');
    }
    
    // Check initial variant param
    const initialVariantParam = personalizeSdk.getVariantParam();
    console.log('   Initial variant param:', initialVariantParam || '(empty - no audience assigned yet)');

    // Save the initial state
    await savePersonalizeState(personalizeSdk);

    return personalizeSdk;
  } catch (error) {
    console.error('❌ Error initializing Personalize SDK:', error);
    return null;
  }
};

/**
 * Get the current user ID from order context or anonymous
 */
export const getUserIdForPersonalization = (orderState?: any): string => {
  // If user has placed orders, use their order ID as identifier
  if (orderState?.orders && orderState.orders.length > 0) {
    return `user_${orderState.orders[0].customerName}_${orderState.orders[0].id}`;
  }
  
  // Otherwise use anonymous ID
  return generateAnonymousId();
};

/**
 * Get variant parameter from Personalize SDK
 * This adds personalization to Contentstack API requests
 * @param personalizeSdk - Initialized Personalize SDK instance
 * @returns Variant parameter for URL query string
 */
export const getVariantParam = (personalizeSdk: any): string => {
  try {
    if (!personalizeSdk) {
      console.warn('⚠️ Personalize SDK not initialized, returning default variant');
      return '';
    }

    console.log('🔍 DEBUG: Getting variant param from SDK...');
    console.log('   SDK instance:', personalizeSdk ? 'exists' : 'null');
    console.log('   SDK has getVariantParam:', typeof personalizeSdk.getVariantParam);
    
    // Check if SDK has manifest data
    if (personalizeSdk._manifest) {
      console.log('   SDK manifest:', personalizeSdk._manifest);
    }
    
    // Check user attributes
    const savedAttrs = localStorage.getItem('cs_personalize_user_attributes');
    if (savedAttrs) {
      console.log('   Saved user attributes:', savedAttrs);
    }

    // Get the variant parameter from the SDK
    const variantParam = personalizeSdk.getVariantParam();
    console.log('🎯 Personalize variant param returned:', variantParam || '(empty)');
    
    if (!variantParam) {
      console.warn('⚠️ SDK returned empty variant param!');
      console.log('   This might mean:');
      console.log('   - No matching audience rules in Contentstack');
      console.log('   - User attributes not set correctly');
      console.log('   - SDK needs reinitialization');
    }
    
    return variantParam || '';
  } catch (error) {
    console.error('❌ Error getting variant param:', error);
    console.error('   Error details:', error);
    return '';
  }
};

/**
 * Add variant parameter to URL for personalized content
 * @param url - Base URL
 * @param personalizeSdk - Initialized Personalize SDK instance
 * @returns URL with variant parameter added
 */
export const addVariantParamToUrl = (url: string, personalizeSdk: any): string => {
  try {
    if (!personalizeSdk) {
      return url;
    }

    const variantParam = getVariantParam(personalizeSdk);
    
    if (!variantParam) {
      return url;
    }

    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Set the variant parameter as a query param
    // Use the SDK's constant for the parameter name
    const variantQueryParam = personalizeSdk.VARIANT_QUERY_PARAM || 'variant';
    parsedUrl.searchParams.set(variantQueryParam, variantParam);
    
    console.log('🔗 Modified URL with variant:', parsedUrl.toString());
    
    return parsedUrl.toString();
  } catch (error) {
    console.error('❌ Error adding variant param to URL:', error);
    return url;
  }
};

/**
 * Check if URL should be excluded from personalization processing
 * Similar to Edge Function's asset exclusion for performance
 * @param url - URL to check
 * @returns true if URL should be excluded
 */
export const shouldExcludeFromPersonalization = (url: string): boolean => {
  const excludedPatterns = [
    '_next',
    'favicon.ico',
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '/static/',
    '/assets/',
  ];
  
  return excludedPatterns.some(pattern => url.includes(pattern));
};

// ==================== PERSONALIZED REQUEST HANDLING ====================

/**
 * Create modified fetch request with personalization
 * Adapts complete Edge Function logic for client-side React
 * Includes: variant parameters, state management, cache control
 * @param url - URL to fetch
 * @param personalizeSdk - Initialized Personalize SDK instance
 * @param options - Fetch options
 * @returns Modified fetch request
 */
export const createPersonalizedRequest = async (
  url: string,
  personalizeSdk: any,
  options?: RequestInit
): Promise<Response> => {
  try {
    // Performance optimization: Exclude static assets from personalization
    if (shouldExcludeFromPersonalization(url)) {
      console.log('⏭️  Skipping personalization for asset:', url);
      return fetch(url, options);
    }

    // Add variant parameter to URL
    const modifiedUrl = addVariantParamToUrl(url, personalizeSdk);
    
    console.log('📡 Making personalized request to:', modifiedUrl);
    
    // Make the request with the modified URL
    // Add cache control header to ensure response is not cached
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options?.headers,
        'cache-control': 'no-store', // Ensure fresh personalized content
      },
    };
    
    const response = await fetch(modifiedUrl, fetchOptions);
    
    // Save Personalize state (equivalent to addStateToResponse in Edge Function)
    await savePersonalizeState(personalizeSdk);
    
    console.log('✅ Personalized request completed and state saved');
    
    return response;
  } catch (error) {
    console.error('❌ Error making personalized request:', error);
    // Fallback to original URL if personalization fails
    return fetch(url, options);
  }
};

/**
 * Create a modified Response object with Personalize state
 * Most similar to Edge Function's response modification
 * @param response - Original Response
 * @param personalizeSdk - Initialized Personalize SDK instance
 * @returns Modified Response with state
 */
export const createPersonalizedResponse = async (
  response: Response,
  personalizeSdk: any
): Promise<Response> => {
  try {
    if (!personalizeSdk) {
      return response;
    }

    // Clone the response to avoid consuming the body
    const modifiedResponse = response.clone();
    
    // Save state to localStorage/cookies
    await savePersonalizeState(personalizeSdk);
    
    // If SDK has addStateToResponse method, try to use it
    if (typeof personalizeSdk.addStateToResponse === 'function') {
      console.log('🍪 Adding Personalize state to response via SDK');
      await personalizeSdk.addStateToResponse(modifiedResponse);
    }
    
    console.log('✅ Response modified with Personalize state');
    
    return modifiedResponse;
  } catch (error) {
    console.error('❌ Error creating personalized response:', error);
    return response;
  }
};

/**
 * Set user attributes for Personalize audience targeting
 * @param personalizeSdk - Initialized Personalize SDK instance
 * @param attributes - Key-value pairs of user attributes
 */
export const setUserAttributes = async (
  personalizeSdk: any,
  attributes: Record<string, string>
): Promise<void> => {
  try {
    if (!personalizeSdk) {
      console.warn('⚠️ Personalize SDK not initialized, cannot set user attributes');
      return;
    }

    console.log('🎯 Setting user attributes for audience targeting:', attributes);
    console.log('   SDK instance type:', typeof personalizeSdk);
    console.log('   SDK methods:', Object.keys(personalizeSdk).filter(k => typeof personalizeSdk[k] === 'function'));

    // Set attributes using SDK method
    if (typeof personalizeSdk.setAttribute === 'function') {
      console.log('   Using setAttribute method');
      for (const [key, value] of Object.entries(attributes)) {
        await personalizeSdk.setAttribute(key, value);
        console.log(`✅ Set attribute: ${key} = ${value}`);
      }
    } else if (typeof personalizeSdk.setAttributes === 'function') {
      console.log('   Using setAttributes method');
      await personalizeSdk.setAttributes(attributes);
      console.log('✅ Set all attributes:', attributes);
    } else {
      console.warn('⚠️ Personalize SDK does not support setAttribute/setAttributes methods');
      console.log('   Available methods:', Object.keys(personalizeSdk).filter(k => typeof personalizeSdk[k] === 'function'));
    }

    // Check SDK manifest after setting attributes
    console.log('🔍 Checking SDK state after setting attributes...');
    if (personalizeSdk._manifest) {
      console.log('   SDK manifest:', personalizeSdk._manifest);
    }
    if (personalizeSdk._userAttributes) {
      console.log('   SDK user attributes:', personalizeSdk._userAttributes);
    }

    // Save attributes to localStorage for persistence
    const existingAttributes = JSON.parse(
      localStorage.getItem('cs_personalize_user_attributes') || '{}'
    );
    const updatedAttributes = { ...existingAttributes, ...attributes };
    localStorage.setItem('cs_personalize_user_attributes', JSON.stringify(updatedAttributes));
    console.log('💾 Saved user attributes to localStorage:', updatedAttributes);

    // Save state to ensure attributes are persisted
    await savePersonalizeState(personalizeSdk);
    
    // Try to get variant param immediately to see if it's working
    console.log('🔍 Testing variant param after setting attributes...');
    const testVariantParam = personalizeSdk.getVariantParam ? personalizeSdk.getVariantParam() : null;
    console.log('   Immediate variant param result:', testVariantParam || '(empty)');
  } catch (error) {
    console.error('❌ Error setting user attributes:', error);
  }
};

/**
 * Get user attributes from localStorage
 * @returns User attributes object
 */
export const getUserAttributes = (): Record<string, string> => {
  try {
    const attributes = localStorage.getItem('cs_personalize_user_attributes');
    return attributes ? JSON.parse(attributes) : {};
  } catch (error) {
    console.error('❌ Error getting user attributes:', error);
    return {};
  }
};

/**
 * Determine coffee preference from order items for audience targeting
 * Maps to Contentstack Personalize audiences
 * Returns the attribute name and value to set
 * @param items - Order items
 * @returns Object with attribute name and value
 */
export const getCoffeePreferenceAttribute = (items: Array<{ type?: string; title?: string }>): { attributeName: string; attributeValue: string } => {
  if (items.length === 0) {
    return { attributeName: 'preference', attributeValue: 'mixed' };
  }

  console.log('🔍 Analyzing order items for audience assignment:');
  console.log('   Items:', items.map(item => ({ title: item.title, type: item.type })));

  // Count items by type
  const typeCounts = items.reduce((acc, item) => {
    const type = item.type || 'default';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Order type counts:', typeCounts);

  // Determine dominant type
  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  console.log(`🔝 Dominant type in order: "${dominantType}"`);

  // Map to correct Contentstack attribute based on type
  // Each coffee type has its own separate attribute!
  const attributeMapping: Record<string, { attributeName: string; attributeValue: string }> = {
    'mocha': {
      attributeName: 'Cocoa Brew',      // Contentstack attribute name
      attributeValue: 'cocoabrew'       // Value from your screenshot
    },
    'hot': {
      attributeName: 'Hot Brew',        // Contentstack attribute name
      attributeValue: 'hotbrew'         // Value from your screenshot
    },
    'cold': {
      attributeName: 'Cold Brew',       // Contentstack attribute name
      attributeValue: 'coldbrew'        // Value from your screenshot
    },
    'default': {
      attributeName: 'preference',
      attributeValue: 'mixed'
    }
  };

  const result = attributeMapping[dominantType] || attributeMapping['default'];
  
  console.log(`🎯 Mapping: "${dominantType}" → Attribute: "${result.attributeName}" = "${result.attributeValue}"`);
  console.log(`✅ Will set: ${result.attributeName} = "${result.attributeValue}"`);

  return result;
};

export default initPersonalizeSdk;