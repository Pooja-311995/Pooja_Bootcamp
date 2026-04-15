// Using REST API approach instead of SDK due to better compatibility
// The REST API works reliably with delivery tokens

// Check if required environment variables are set
const apiKey = process.env.REACT_APP_CONTENTSTACK_API_KEY;
const deliveryToken = process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN;
const environment = process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || 'development';
const host = process.env.REACT_APP_CONTENTSTACK_DELIVERY_API_HOST || 'cdn.contentstack.io';

if (!apiKey || !deliveryToken) {
  console.warn('⚠️  Contentstack environment variables not configured:');
  console.warn('   For React client-side usage, create a .env file with:');
  console.warn('   REACT_APP_CONTENTSTACK_API_KEY=your_api_key');
  console.warn('   REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token');
  console.warn('   REACT_APP_CONTENTSTACK_ENVIRONMENT=your_environment');
} else {
  console.log('✅ Contentstack REST API configured:', {
    api_key: '***' + apiKey.slice(-4),
    baseUrl: 'https://cdn.contentstack.io/v3'
  });
}

// Export null for Stack (not using SDK)
const Stack = null;

// Export configuration for REST API calls
export const contentstackConfig = {
  apiKey,
  deliveryToken,
  environment,
  baseUrl: 'https://cdn.contentstack.io/v3',
  host
};

export default Stack;
