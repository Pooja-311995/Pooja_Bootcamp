import ContentstackLivePreview from '@contentstack/live-preview-utils';

// Contentstack configuration from environment
const contentstackConfig = {
  apiKey: process.env.REACT_APP_CONTENTSTACK_API_KEY || '',
  deliveryToken: process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN || '',
  environment: process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || '',
  region: process.env.REACT_APP_CONTENTSTACK_REGION || 'us'
};

/**
 * Initialize Contentstack Live Preview
 * This enables real-time content updates when editing in Contentstack UI
 */
export const initializeLivePreview = () => {
  try {
    // Only initialize in development mode or when explicitly enabled
    const isLivePreviewEnabled = 
      process.env.NODE_ENV === 'development' || 
      process.env.REACT_APP_ENABLE_LIVE_PREVIEW === 'true';

    if (isLivePreviewEnabled && contentstackConfig.apiKey) {
      ContentstackLivePreview.init({
        stackSdk: {
          apiKey: contentstackConfig.apiKey,
          deliveryToken: contentstackConfig.deliveryToken,
          environment: contentstackConfig.environment,
          live_preview: {
            enable: true,
            host: contentstackConfig.region === 'eu' 
              ? 'eu-api.contentstack.com' 
              : 'api.contentstack.io',
          },
        },
        enable: true,
        // Live preview will work alongside your existing REST API calls
        debug: process.env.NODE_ENV === 'development',
        // Client URL for CORS and iframe communication
        clientUrlParams: {
          protocol: 'http',
          host: 'localhost',
          port: 3000,
        },
      });

      console.log('✅ Contentstack Live Preview initialized');
      console.log('🔴 Live mode: Content will update in real-time from Contentstack');
      console.log('🌐 Preview URL: http://localhost:3000');
      console.log('📋 Configure this URL in Contentstack Live Preview settings');
      
      return true;
    } else {
      console.log('ℹ️ Contentstack Live Preview disabled (production mode)');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Contentstack Live Preview:', error);
    return false;
  }
};

/**
 * Optional: Get live preview query parameters
 * Use this if you need to detect when in preview mode
 */
export const isInLivePreviewMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const params = new URLSearchParams(window.location.search);
  return params.has('live_preview') || params.has('contentstack_preview');
};

/**
 * Optional: Add live preview edit tags to content
 * This makes content clickable for editing in Contentstack
 */
export const addEditableTags = (contentTypeUid: string, entryUid: string, locale: string = 'en-us') => {
  if (!isInLivePreviewMode()) return {};
  
  return {
    'data-cslp': `${contentTypeUid}.${entryUid}.${locale}`,
  };
};

const livePreviewUtils = {
  initializeLivePreview,
  isInLivePreviewMode,
  addEditableTags,
};

export default livePreviewUtils;
