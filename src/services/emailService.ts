/**
 * Email Service - Contentstack Automation Integration
 * Sends order confirmation emails via Contentstack automation webhook
 */

interface OrderItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  type?: string;
}

interface OrderEmailData {
  orderId: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerEmail?: string;
}

/**
 * Format order items for email body
 */
const formatOrderItems = (items: OrderItem[]): string => {
  return items.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    const typeInfo = item.type ? ` (${item.type})` : '';
    return `${index + 1}. ${item.title}${typeInfo}
     Quantity: ${item.quantity}
     Price: ₹${item.price} x ${item.quantity} = ₹${itemTotal.toFixed(2)}`;
  }).join('\n\n');
};

/**
 * Format the complete email body with order details
 */
const formatEmailBody = (orderData: OrderEmailData): string => {
  const orderItemsFormatted = formatOrderItems(orderData.items);
  
  // Use multiple newlines for proper paragraph spacing in emails
  return `Hi ${orderData.customerName},

Thanks for choosing Grabo — your coffee is now officially on schedule!

We've received your order #${orderData.orderId} and our team is already preparing it with care.


ORDER DETAILS

${orderItemsFormatted}

TOTAL AMOUNT: ₹${orderData.total.toFixed(2)}


At Grabo, we believe in:
  ☕ Coffee on schedule
  ✨ Quality in every cup
  🌱 Sustainability through our reusable cups initiative

Every sip helps save the planet!


Warmly,
Team Grabo`;
};

/**
 * Send order confirmation email via Contentstack automation webhook
 */
export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL SERVICE: Starting order confirmation email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Order ID:', orderData.orderId);
    console.log('👤 Customer:', orderData.customerName);
    console.log('💰 Total:', '₹' + orderData.total.toFixed(2));
    console.log('🛒 Items count:', orderData.items.length);
    
    // Use provided email or default to test email
    const recipientEmail = orderData.customerEmail || 'pooja.mandwale@contentstack.com';
    console.log('📧 Recipient email:', recipientEmail);
    
    // Format the email body with order details
    const emailBody = formatEmailBody(orderData);
    console.log('📝 Email body length:', emailBody.length, 'characters');
    console.log('📄 Email body preview (first 300 chars):');
    console.log(emailBody.substring(0, 300) + '...\n');
    
    // Contentstack automation webhook URL
    const automationUrl = 'https://app.contentstack.com/automations-api/run/e4b5b323da00490bb572847a94b7ee06';
    console.log('🔗 Webhook URL:', automationUrl);
    
    // URL encode the parameters
    const params = new URLSearchParams({
      To: recipientEmail,
      Subject: `Order Confirmation #${orderData.orderId} – Thanks for Brewing with Us!`,
      Body: emailBody
    });
    
    const fullUrl = `${automationUrl}?${params.toString()}`;
    console.log('📡 Full request URL length:', fullUrl.length);
    console.log('🔗 Full URL (first 200 chars):', fullUrl.substring(0, 200) + '...');
    
    console.log('\n⏳ Sending request to Contentstack automation...');
    
    // Send the email via Contentstack automation
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📨 Response status:', response.status, response.statusText);
    console.log('📨 Response headers:', JSON.stringify(Array.from(response.headers.entries())));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ EMAIL FAILED - Response status:', response.status);
      console.error('❌ EMAIL FAILED - Status text:', response.statusText);
      console.error('❌ EMAIL FAILED - Error body:', errorText);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
    
    const result = await response.text();
    console.log('✅ Response body:', result);
    console.log('✅ Email sent successfully!');
    console.log('📧 Confirmation email sent to:', recipientEmail);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ EMAIL SERVICE: Completed successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL ERROR in sendOrderConfirmationEmail:');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Full error object:', error);
    if (error instanceof Error && error.stack) {
      console.error('❌ Stack trace:', error.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return false;
  }
};

/**
 * Send a simple test email (for testing purposes)
 */
export const sendTestEmail = async (
  recipientEmail: string = 'pooja.mandwale@contentstack.com'
): Promise<boolean> => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TEST EMAIL: Starting test email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Recipient:', recipientEmail);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const automationUrl = 'https://app.contentstack.com/automations-api/run/e4b5b323da00490bb572847a94b7ee06';
    console.log('🔗 Webhook URL:', automationUrl);
    
    const testBody = `Hi,


This is a test email from Grabo to verify the email automation is working correctly.


Test Details:
• Sent at: ${new Date().toLocaleString()}
• Recipient: ${recipientEmail}
• Test ID: TEST-${Math.random().toString(36).substr(2, 6).toUpperCase()}


If you're seeing this, the Contentstack automation webhook is configured properly!


Warmly,
Team Grabo`;
    
    const params = new URLSearchParams({
      To: recipientEmail,
      Subject: 'Test Email – Grabo Email Automation',
      Body: testBody
    });
    
    const fullUrl = `${automationUrl}?${params.toString()}`;
    console.log('📡 Request URL length:', fullUrl.length);
    console.log('📡 Sending GET request...\n');
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📨 Response status:', response.status, response.statusText);
    console.log('📨 Response headers:', JSON.stringify(Array.from(response.headers.entries())));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TEST EMAIL FAILED');
      console.error('❌ Status:', response.status, response.statusText);
      console.error('❌ Error body:', errorText);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return false;
    }
    
    const result = await response.text();
    console.log('✅ Response body:', result);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email sent to:', recipientEmail);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ TEST EMAIL: Completed successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return true;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL ERROR in sendTestEmail:');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Full error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return false;
  }
};

/**
 * Quick diagnostic function to test the webhook
 * Call this from browser console: window.testGraboEmail()
 */
export const diagnoseEmailService = async (): Promise<void> => {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       GRABO EMAIL SERVICE DIAGNOSTIC TOOL             ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 Configuration Check:');
  console.log('  • Webhook URL: https://app.contentstack.com/automations-api/run/e4b5b323da00490bb572847a94b7ee06');
  console.log('  • Default recipient: pooja.mandwale@contentstack.com');
  console.log('  • Method: GET');
  console.log('  • Parameters: To, Subject, Body (URL encoded)');
  console.log('');
  
  console.log('🧪 Running test email...');
  console.log('');
  
  const result = await sendTestEmail('pooja.mandwale@contentstack.com');
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                  DIAGNOSTIC RESULTS                    ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  
  if (result) {
    console.log('✅ SUCCESS: Email service is working correctly');
    console.log('');
    console.log('📬 Next Steps:');
    console.log('  1. Check your email inbox: pooja.mandwale@contentstack.com');
    console.log('  2. Check spam/junk folder');
    console.log('  3. Wait 1-2 minutes for delivery');
    console.log('  4. If still not received, check Contentstack automation logs');
  } else {
    console.log('❌ FAILURE: Email service encountered an error');
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('  1. Check the error messages above');
    console.log('  2. Verify Contentstack automation is enabled');
    console.log('  3. Check webhook URL is correct');
    console.log('  4. Verify network connectivity');
    console.log('  5. Check browser console for CORS errors');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testGraboEmail = diagnoseEmailService;
  (window as any).sendGraboTestEmail = sendTestEmail;
}

const emailService = {
  sendOrderConfirmationEmail,
  sendTestEmail,
  diagnoseEmailService,
};

export default emailService;

