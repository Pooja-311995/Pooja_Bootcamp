// Quick API test script
const fetch = require('node-fetch');

const apiKey = 'bltb34bfa72850a449c';
const deliveryToken = 'csa6deb56c24d904c40904f739';
const baseUrl = 'https://cdn.contentstack.io/v3';
const contentType = 'page';

async function testAPI() {
  try {
    console.log('🔍 Testing Contentstack API...\n');
    
    const url = `${baseUrl}/content_types/${contentType}/entries`;
    console.log('URL:', url);
    console.log('API Key:', apiKey);
    console.log('Token:', deliveryToken.substring(0, 10) + '...\n');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'branch': 'main',
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Success! Found', data.entries?.length || 0, 'entries\n');
    
    if (data.entries) {
      console.log('Page entries:');
      data.entries.forEach((entry, i) => {
        console.log(`\n${i + 1}. ${entry.title || 'Untitled'}`);
        console.log('   UID:', entry.uid);
        console.log('   URL:', entry.url || 'N/A');
        console.log('   Has hero_banner:', !!entry.hero_banner);
        if (entry.hero_banner) {
          if (Array.isArray(entry.hero_banner)) {
            console.log('   Hero banner is array with', entry.hero_banner.length, 'items');
            if (entry.hero_banner[0]) {
              console.log('   First item:', {
                title: entry.hero_banner[0].banner_title,
                hasImage: !!entry.hero_banner[0].banner_image
              });
            }
          } else {
            console.log('   Hero banner:', {
              title: entry.hero_banner.banner_title,
              hasImage: !!entry.hero_banner.banner_image
            });
          }
        }
      });
      
      // Find cart page
      const cartPage = data.entries.find(e => 
        e.url === '/cart' || 
        e.title?.toLowerCase().includes('cart') ||
        e.uid === 'blt6a3aff15372739ee'
      );
      
      if (cartPage) {
        console.log('\n🛒 Cart page found!');
        console.log(JSON.stringify(cartPage, null, 2));
      } else {
        console.log('\n❌ Cart page not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();

