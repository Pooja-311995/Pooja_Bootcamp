#!/usr/bin/env node

/**
 * Test Script: Fetch All Pages Data from Contentstack
 * 
 * This script fetches all pages, cards, and content from Contentstack
 * and displays a comprehensive summary.
 * 
 * Usage:
 *   node test-fetch-all-pages.js
 */

require('dotenv').config();
const contentstack = require('contentstack');

// Check environment variables
const apiKey = process.env.REACT_APP_CONTENTSTACK_API_KEY;
const deliveryToken = process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN;
const environment = process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || 'development';

if (!apiKey || !deliveryToken) {
  console.error('❌ Missing Contentstack credentials!');
  console.error('   Make sure .env file has:');
  console.error('   REACT_APP_CONTENTSTACK_API_KEY');
  console.error('   REACT_APP_CONTENTSTACK_DELIVERY_TOKEN');
  process.exit(1);
}

// Initialize Contentstack SDK
// Note: delivery_token is already tied to an environment,
// so we don't need to specify environment separately
const Stack = contentstack.Stack({
  api_key: apiKey,
  delivery_token: deliveryToken,
  region: contentstack.Region.US
});

console.log('✅ Contentstack SDK initialized');
console.log(`   API Key: ***${apiKey.slice(-4)}`);
console.log(`   Region: US`);
console.log(`   Note: Environment is implicit in delivery token\n`);

/**
 * Fetch all entries for a content type
 */
async function fetchContentType(contentTypeUid, displayName) {
  try {
    console.log(`📡 Fetching ${displayName}...`);
    const result = await Stack.ContentType(contentTypeUid).Query().toJSON().find();
    
    // Debug: Log the full result structure
    console.log(`   Raw result type: ${typeof result}`);
    console.log(`   Raw result is array: ${Array.isArray(result)}`);
    
    // Handle different response formats
    let entries = [];
    if (Array.isArray(result)) {
      // Format 1: [entries, metadata]
      entries = result[0] || [];
    } else if (result && result.entries) {
      // Format 2: { entries: [...], ... }
      entries = result.entries || [];
    } else if (result) {
      // Format 3: Direct array or object
      entries = [result];
    }
    
    console.log(`✅ Found ${entries.length} ${displayName}`);
    return entries;
  } catch (error) {
    console.error(`❌ Error fetching ${displayName}:`, error.message || error);
    console.error(`   Stack trace:`, error.stack);
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

  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ALL PAGES DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`⏱️  Fetch Duration: ${duration}s`);
  console.log(`📄 Total Pages: ${pages.length}`);
  console.log(`🃏 Total Cards: ${cards.length}`);
  console.log(`⭐ Total Featured Sections: ${featuredSections.length}`);
  console.log(`📖 Total Story Sections: ${storySections.length}`);
  console.log(`📰 Total Blog Posts: ${blogPosts.length}`);
  console.log(`⭐ Total Review Sections: ${reviewSections.length}`);
  console.log('='.repeat(60) + '\n');

  // Display detailed breakdown
  console.log('📄 PAGES:');
  console.log('-'.repeat(60));
  if (pages.length === 0) {
    console.log('   No pages found');
  } else {
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.title}`);
      console.log(`      UID: ${page.uid}`);
      console.log(`      URL: ${page.url || 'N/A'}`);
      console.log(`      Has Hero Banner: ${page.reference_hero_banner ? 'Yes' : 'No'}`);
      console.log(`      Has Story Section: ${page.reference_story_section ? 'Yes' : 'No'}`);
      console.log(`      Has Coffee Suggestions: ${page.reference_coffee_suggestion ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  console.log('\n🃏 CARDS (Menu Items):');
  console.log('-'.repeat(60));
  if (cards.length === 0) {
    console.log('   No cards found');
  } else {
    const menuCards = cards.filter(card => card.price_of_coffee && card.price_of_coffee > 0);
    const infoCards = cards.filter(card => !card.price_of_coffee || card.price_of_coffee === 0);
    
    console.log(`   Menu Cards (with prices): ${menuCards.length}`);
    menuCards.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.title}`);
      console.log(`      UID: ${card.uid}`);
      console.log(`      Price: ₹${card.price_of_coffee}`);
      console.log(`      Type: ${card.type || 'N/A'}`);
      console.log(`      Has Image: ${card.image_of_coffee ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    if (infoCards.length > 0) {
      console.log(`\n   Informational Cards (no prices): ${infoCards.length}`);
      infoCards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.title} (${card.uid})`);
      });
    }
  }

  console.log('\n⭐ FEATURED COFFEE SECTIONS:');
  console.log('-'.repeat(60));
  if (featuredSections.length === 0) {
    console.log('   No featured sections found');
  } else {
    featuredSections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title}`);
      console.log(`      UID: ${section.uid}`);
      console.log(`      Description: ${section.section_description ? section.section_description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`      Referenced Cards: ${section.reference_menu_options ? section.reference_menu_options.length : 0}`);
      console.log('');
    });
  }

  console.log('\n📖 STORY SECTIONS:');
  console.log('-'.repeat(60));
  if (storySections.length === 0) {
    console.log('   No story sections found');
  } else {
    storySections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title}`);
      console.log(`      UID: ${section.uid}`);
      console.log(`      Has Image: ${section.image ? 'Yes' : 'No'}`);
      console.log(`      Has Button: ${section.call_to_action ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  console.log('\n📰 BLOG POSTS (Hero Banners):');
  console.log('-'.repeat(60));
  if (blogPosts.length === 0) {
    console.log('   No blog posts found');
  } else {
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

  // Return data for potential JSON export
  return {
    pages,
    cards,
    featuredSections,
    storySections,
    blogPosts,
    reviewSections,
    summary: {
      totalPages: pages.length,
      totalCards: cards.length,
      totalMenuCards: cards.filter(c => c.price_of_coffee && c.price_of_coffee > 0).length,
      totalFeaturedSections: featuredSections.length,
      totalStorySections: storySections.length,
      totalBlogPosts: blogPosts.length,
      totalReviewSections: reviewSections.length,
      fetchDuration: `${duration}s`
    }
  };
}

// Run the script
fetchAllPagesData()
  .then(data => {
    console.log('\n✅ Successfully fetched all pages data!');
    console.log('\n💾 To save this data to a file, run:');
    console.log('   node test-fetch-all-pages.js > all-pages-data.json');
  })
  .catch(error => {
    console.error('\n❌ Error fetching pages data:', error);
    process.exit(1);
  });

