#!/usr/bin/env node

/**
 * Fetch All Pages Data using REST API
 * 
 * This script uses the same REST API approach that works in the app
 * to fetch all pages, cards, and content from Contentstack.
 * 
 * Usage:
 *   node fetch-all-pages-rest.js
 *   node fetch-all-pages-rest.js > output.json  (save to file)
 */

require('dotenv').config();

// Check environment variables
const apiKey = process.env.REACT_APP_CONTENTSTACK_API_KEY;
const deliveryToken = process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN;
const baseUrl = 'https://cdn.contentstack.io/v3';

if (!apiKey || !deliveryToken) {
  console.error('❌ Missing Contentstack credentials!');
  console.error('   Make sure .env file has:');
  console.error('   REACT_APP_CONTENTSTACK_API_KEY');
  console.error('   REACT_APP_CONTENTSTACK_DELIVERY_TOKEN');
  process.exit(1);
}

console.log('✅ Using Contentstack REST API');
console.log(`   API Key: ***${apiKey.slice(-4)}`);
console.log(`   Base URL: ${baseUrl}\n`);

/**
 * Fetch all entries for a content type using REST API
 */
async function fetchContentType(contentTypeUid, displayName) {
  try {
    console.log(`📡 Fetching ${displayName}...`);
    
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'branch': 'main',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const entries = data.entries || [];
    
    console.log(`✅ Found ${entries.length} ${displayName}`);
    return entries;
  } catch (error) {
    console.error(`❌ Error fetching ${displayName}:`, error.message);
    return [];
  }
}

/**
 * Main function to fetch all data
 */
async function fetchAllPagesData() {
  console.log('🚀 Starting to fetch ALL pages data from Contentstack...');
  console.log('⏱️  This may take a moment...\n');
  
  const startTime = Date.now();

  // Fetch all content types in parallel
  const [pages, cards, featuredSections, storySections, blogPosts, reviewSections] = await Promise.all([
    fetchContentType('page', 'Pages'),
    fetchContentType('card', 'Cards (Menu Items)'),
    fetchContentType('featured_coffee_section', 'Featured Coffee Sections'),
    fetchContentType('story_section', 'Story Sections'),
    fetchContentType('blog_post', 'Blog Posts (Hero Banners)'),
    fetchContentType('review_section', 'Review Sections')
  ]);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Filter menu cards (with prices) vs info cards
  const menuCards = cards.filter(card => card.price_of_coffee && card.price_of_coffee > 0);
  const infoCards = cards.filter(card => !card.price_of_coffee || card.price_of_coffee === 0);

  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ALL PAGES DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`⏱️  Fetch Duration: ${duration}s`);
  console.log(`📄 Total Pages: ${pages.length}`);
  console.log(`🃏 Total Cards: ${cards.length}`);
  console.log(`   - Menu Cards (with prices): ${menuCards.length}`);
  console.log(`   - Info Cards (no prices): ${infoCards.length}`);
  console.log(`⭐ Total Featured Sections: ${featuredSections.length}`);
  console.log(`📖 Total Story Sections: ${storySections.length}`);
  console.log(`📰 Total Blog Posts: ${blogPosts.length}`);
  console.log(`⭐ Total Review Sections: ${reviewSections.length}`);
  console.log('='.repeat(60) + '\n');

  // Display detailed breakdown
  if (pages.length > 0) {
    console.log('📄 PAGES:');
    console.log('-'.repeat(60));
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.title}`);
      console.log(`      UID: ${page.uid}`);
      console.log(`      URL: ${page.url || 'N/A'}`);
      console.log(`      Has Hero Banner: ${page.reference_hero_banner?.length > 0 ? 'Yes (' + page.reference_hero_banner[0].uid + ')' : 'No'}`);
      console.log(`      Has Story Section: ${page.reference_story_section?.length > 0 ? 'Yes (' + page.reference_story_section[0].uid + ')' : 'No'}`);
      console.log(`      Has Featured Coffee: ${page.reference_featuredcoffee?.length > 0 ? 'Yes (' + page.reference_featuredcoffee[0].uid + ')' : 'No'}`);
      console.log('');
    });
  }

  if (menuCards.length > 0) {
    console.log('\n🃏 MENU CARDS (With Prices):');
    console.log('-'.repeat(60));
    menuCards.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.title}`);
      console.log(`      UID: ${card.uid}`);
      console.log(`      Price: ₹${card.price_of_coffee}`);
      console.log(`      Type: ${card.type || 'N/A'}`);
      console.log(`      Has Image: ${card.image_of_coffee ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  if (infoCards.length > 0) {
    console.log('\n📋 INFO CARDS (No Prices):');
    console.log('-'.repeat(60));
    infoCards.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.title} (${card.uid})`);
    });
    console.log('');
  }

  if (featuredSections.length > 0) {
    console.log('\n⭐ FEATURED COFFEE SECTIONS:');
    console.log('-'.repeat(60));
    featuredSections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title}`);
      console.log(`      UID: ${section.uid}`);
      if (section.section_description) {
        const desc = section.section_description.substring(0, 80);
        console.log(`      Description: ${desc}${section.section_description.length > 80 ? '...' : ''}`);
      }
      console.log(`      Referenced Cards: ${section.reference_menu_options ? section.reference_menu_options.length : 0}`);
      if (section.reference_menu_options && section.reference_menu_options.length > 0) {
        section.reference_menu_options.forEach((ref, i) => {
          console.log(`         ${i + 1}. ${ref.uid}`);
        });
      }
      console.log('');
    });
  }

  if (storySections.length > 0) {
    console.log('\n📖 STORY SECTIONS:');
    console.log('-'.repeat(60));
    storySections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title}`);
      console.log(`      UID: ${section.uid}`);
      console.log(`      Has Image: ${section.image ? 'Yes' : 'No'}`);
      console.log(`      Has Button: ${section.call_to_action ? 'Yes - ' + section.call_to_action.title : 'No'}`);
      console.log('');
    });
  }

  if (blogPosts.length > 0) {
    console.log('\n📰 BLOG POSTS (Hero Banners):');
    console.log('-'.repeat(60));
    blogPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
      console.log(`      UID: ${post.uid}`);
      console.log(`      Has Banner Image: ${post.banner_image ? 'Yes' : 'No'}`);
      console.log(`      Has Video: ${post.background_video ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  if (reviewSections.length > 0) {
    console.log('\n⭐ REVIEW SECTIONS:');
    console.log('-'.repeat(60));
    reviewSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Review Section`);
      console.log(`      UID: ${section.uid}`);
      console.log('');
    });
  }

  // Return data for JSON export
  return {
    metadata: {
      fetchedAt: new Date().toISOString(),
      fetchDuration: `${duration}s`,
      api: 'REST API',
      baseUrl: baseUrl
    },
    summary: {
      totalPages: pages.length,
      totalCards: cards.length,
      totalMenuCards: menuCards.length,
      totalInfoCards: infoCards.length,
      totalFeaturedSections: featuredSections.length,
      totalStorySections: storySections.length,
      totalBlogPosts: blogPosts.length,
      totalReviewSections: reviewSections.length
    },
    pages,
    menuCards,
    infoCards,
    featuredSections,
    storySections,
    blogPosts,
    reviewSections
  };
}

// Run the script
fetchAllPagesData()
  .then(data => {
    console.log('\n✅ Successfully fetched all pages data!');
    console.log('\n💾 Data structure ready for export');
    console.log('   To save as JSON:');
    console.log('   node fetch-all-pages-rest.js > all-pages-data.json\n');
  })
  .catch(error => {
    console.error('\n❌ Error fetching pages data:', error);
    process.exit(1);
  });

