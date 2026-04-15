import { contentstackConfig } from './contentstack';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { MenuItem } from '../types';
import Personalize from '@contentstack/personalize-edge-sdk';

// Type definitions for home page content
export interface HeroBanner {
  banner_title?: string;
  banner_subtitle?: string;
  banner_description?: string;
  banner_image?: {
    url: string;
    title?: string;
  };
  call_to_action?: {
    title: string;
    href: string;
  };
  bg_color?: string;
  text_color?: string;
}

export interface PageContent {
  title: string;
  url?: string;
  page_components?: any[];
  uid: string;
}

export interface HomePageData {
  hero_banner?: HeroBanner;
  about_section?: any;
  services_section?: any;
  testimonial_section?: any;
  outro_section?: any;
}

export interface CartPageData {
  title?: string;
  hero_banner?: HeroBanner;
  page_description?: string;
  uid: string;
}

export interface OrderSummaryData {
  title: string;
  subtotal_label: string;
  delivery_fee_label: string;
  total_label: string;
  button: {
    button_label: string;
    add_more_items: {
      title: string;
      href: string;
    };
  };
  button_2: {
    button_label: string;
    place_order: {
      title: string;
      href: string;
    };
  };
  uid: string;
}

export interface OrderStatusData {
  title: string;
  order_id_label: string;
  status: string;
  available_menu_cards: MenuItem[];
  uid: string;
}

export interface ReviewSectionData {
  title: string;
  rating_label: string;
  review_comment_label: string;
  submit_button: {
    title: string;
    href: string;
  };
  cancel_button: {
    title: string;
    href: string;
  };
  uid: string;
}

// ==================== REST API FUNCTIONS ====================

/**
 * Fetch entries from Contentstack REST API with optional personalization variants
 * @param contentTypeUid - Content type UID
 * @param variantParam - Optional variant parameter from Personalize SDK
 * @returns Contentstack entries data
 */
export async function fetchContentstackEntries(
  contentTypeUid: string,
  variantParam?: string
): Promise<any> {
  const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
  
  if (!apiKey || !deliveryToken) {
    console.log('Contentstack not configured, returning null');
    return null;
  }

  try {
    // Build URL with variant aliases if provided
    let url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    const params = new URLSearchParams();
    
    // Add variant aliases if variant parameter exists
    if (variantParam) {
      try {
        // Decode the variant parameter
        const decodedVariantParam = decodeURIComponent(variantParam);
        console.log('🎯 Decoded variant parameter:', decodedVariantParam);
        
        // Convert variant parameter to variant aliases
        const variantAliases = Personalize.variantParamToVariantAliases(decodedVariantParam);
        const variantAliasesStr = variantAliases.join(',');
        
        console.log('🎯 Variant aliases:', variantAliasesStr);
        
        // Add to URL parameters
        if (variantAliasesStr) {
          params.set('variants', variantAliasesStr);
        }
      } catch (error) {
        console.error('❌ Error processing variant parameter:', error);
        // Continue without variants if there's an error
      }
    }
    
    // Add params to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('📡 Fetching from Contentstack REST API:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (variantParam) {
      console.log('✅ Fetched personalized data from Contentstack REST API:', data);
    } else {
      console.log('✅ Fetched data from Contentstack REST API:', data);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error fetching entries for ${contentTypeUid}:`, error);
    return null;
  }
}

/**
 * Fetch menu items with optional personalization
 * @param variantParam - Optional variant parameter for personalized menu
 * @returns Array of menu items
 */
export async function getMenuItems(variantParam?: string): Promise<MenuItem[]> {
  try {
    console.log('🔄 Fetching menu items using REST API...');
    if (variantParam) {
      console.log('🎯 Fetching personalized menu with variant:', variantParam);
    }
    const result = await fetchContentstackEntries('card', variantParam);
    
    if (!result || !result.entries) {
      console.log('No entries found, returning empty array');
      return [];
    }

    console.log(`📋 Found ${result.entries.length} total card entries in Contentstack`);

    // Filter to only include cards with valid prices (exclude informational cards)
    const menuCardEntries = result.entries.filter((entry: any) => {
      return entry.price_of_coffee !== null && entry.price_of_coffee !== undefined && entry.price_of_coffee > 0;
    });

    console.log(`🍵 Filtered to ${menuCardEntries.length} actual menu items (cards with prices)`);

    // Import getCoffeeType for type mapping (fallback)
    const { getCoffeeType } = await import('../utils/coffeeTypeMapper');

    // Helper to normalize type from Contentstack
    const normalizeType = (type: string | undefined | null): string | undefined => {
      if (!type) return undefined;
      
      const normalized = type.toLowerCase().trim();
      
      // Map variations to standard types
      if (normalized === 'cocoa' || normalized === 'mocha' || normalized === 'chocolate') {
        return 'mocha';
      }
      
      if (normalized === 'hot' || normalized === 'warm') {
        return 'hot';
      }
      
      if (normalized === 'cold' || normalized === 'iced') {
        return 'cold';
      }
      
      return normalized;
    };

    // Transform Contentstack entries to MenuItem format
    const menuItems: MenuItem[] = menuCardEntries.map((entry: any) => {
      // Prefer Contentstack type if available, otherwise use title-based mapping
      const contentstackType = normalizeType(entry.type);
      const fallbackType = getCoffeeType(entry.title);
      const finalType = contentstackType || fallbackType;
      
      if (contentstackType) {
        console.log(`✅ ${entry.title}: Using Contentstack type "${entry.type}" → normalized to "${contentstackType}"`);
      } else {
        console.log(`⚠️  ${entry.title}: No Contentstack type, using fallback "${fallbackType}"`);
      }
      
      return {
      id: entry.uid,
      title: entry.title || 'Untitled',
      description: (entry.know_your_coffee || 'No description available').replace(/<[^>]*>/g, '').trim(),
        price: `₹${entry.price_of_coffee}`,
        image: entry.image_of_coffee?.url || '/assets/images/home/services_placeholder.jpg',
        type: finalType
      };
    });

    console.log('✅ Transformed menu items:', menuItems);
    console.log(`🎉 Successfully loaded ${menuItems.length} menu cards:`);
    menuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.type}) - ${item.price}`);
    });
    
    return menuItems;
  } catch (error) {
    console.error('❌ Error in getMenuItems:', error);
    return [];
  }
}

/**
 * Fetch default featured coffee section for Menu page
 * This shows when no personalization is active
 * @returns Featured section data with referenced menu cards
 */
export async function getDefaultFeaturedSection(): Promise<any> {
  try {
    console.log('🌟 Fetching default featured coffee section...');
    
    const entryUid = 'bltfdc6dd39ccd0271b'; // Our Crowd Favorites
    const featuredSection = await getEntry('featured_coffee_section', entryUid);
    
    if (!featuredSection || !featuredSection.entry) {
      console.log('⚠️  No default featured section found');
      return null;
    }

    const section = featuredSection.entry;
    console.log('✅ Featured section loaded:', section.title);
    
    // Fetch the referenced menu cards
    const referencedCards = section.reference_menu_options || [];
    console.log(`📋 Featured section has ${referencedCards.length} referenced cards`);
    
    if (referencedCards.length > 0) {
      // Fetch all referenced cards
      const cardPromises = referencedCards.map((ref: any) => 
        getEntry('card', ref.uid)
      );
      
      const cardResults = await Promise.all(cardPromises);
      
      // Transform cards to MenuItem format
      const { getCoffeeType } = await import('../utils/coffeeTypeMapper');
      
      const cards = cardResults
        .filter(result => result && result.entry)
        .map(result => result.entry)
        .filter(entry => entry.price_of_coffee && entry.price_of_coffee > 0)
        .map((entry: any) => {
          const contentstackType = entry.type?.toLowerCase();
          const normalizedType = contentstackType === 'cocoa' || contentstackType === 'mocha' ? 'mocha' : contentstackType;
          const finalType = normalizedType || getCoffeeType(entry.title);
          
          return {
            id: entry.uid,
            title: entry.title || 'Untitled',
            description: (entry.know_your_coffee || 'No description available').replace(/<[^>]*>/g, '').trim(),
            price: `₹${entry.price_of_coffee}`,
            image: entry.image_of_coffee?.url || '/assets/images/home/services_placeholder.jpg',
            type: finalType
          };
        });
      
      console.log(`✅ Loaded ${cards.length} featured cards:`, cards.map(c => c.title));
      
      return {
        title: section.title,
        description: section.section_description,
        cards: cards
      };
    }
    
    return {
      title: section.title,
      description: section.section_description,
      cards: []
    };
  } catch (error) {
    console.error('❌ Error fetching default featured section:', error);
    return null;
  }
}

// Other functions using REST API approach
/**
 * Fetch a single entry from Contentstack with optional personalization variants
 * @param contentTypeUid - Content type UID
 * @param entryUid - Entry UID
 * @param variantParam - Optional variant parameter from Personalize SDK
 * @returns Contentstack entry data
 */
/**
 * Fetch a single entry using Contentstack REST API with optional personalization variants
 * @param contentTypeUid - Content type UID
 * @param entryUid - Entry UID
 * @param variantParam - Optional variant parameter from Personalize SDK
 * @returns Single entry data
 */
export async function getEntry(
  contentTypeUid: string,
  entryUid: string,
  variantParam?: string
): Promise<any> {
  const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
  
  if (!apiKey || !deliveryToken) {
    return null;
  }

  try {
    // Build URL with variant aliases if provided
    let url = `${baseUrl}/content_types/${contentTypeUid}/entries/${entryUid}`;
    const params = new URLSearchParams();
    
    // Add variant aliases if variant parameter exists
    if (variantParam) {
      try {
        // Decode the variant parameter
        const decodedVariantParam = decodeURIComponent(variantParam);
        console.log('🎯 Decoded variant parameter for entry:', decodedVariantParam);
        
        // Convert variant parameter to variant aliases
        const variantAliases = Personalize.variantParamToVariantAliases(decodedVariantParam);
        const variantAliasesStr = variantAliases.join(',');
        
        console.log('🎯 Variant aliases for entry:', variantAliasesStr);
        
        // Add to URL parameters
        if (variantAliasesStr) {
          params.set('variants', variantAliasesStr);
        }
      } catch (error) {
        console.error('❌ Error processing variant parameter:', error);
        // Continue without variants if there's an error
      }
    }
    
    // Add params to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('📡 Fetching entry from Contentstack REST API:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (variantParam) {
      console.log('✅ Fetched personalized entry from Contentstack REST API');
    }
    
    return data.entry;
  } catch (error) {
    console.error(`❌ Error fetching entry ${entryUid}:`, error);
    return null;
  }
}

export async function getEntries(contentTypeUid: string): Promise<any> {
  return await fetchContentstackEntries(contentTypeUid);
}

export async function getPageByUrl(url: string): Promise<any> {
  // Implementation for page lookup by URL using REST API
  return await fetchContentstackEntries('page');
}

export async function getContentType(contentTypeUid: string): Promise<any> {
  const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
  
  if (!apiKey || !deliveryToken) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/content_types/${contentTypeUid}`, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching content type ${contentTypeUid}:`, error);
    return null;
  }
}

export async function getAsset(assetUid: string): Promise<any> {
  const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
  
  if (!apiKey || !deliveryToken) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/assets/${assetUid}`, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching asset ${assetUid}:`, error);
    return null;
  }
}

// Helper functions for compatibility
export function getStackInstance() {
  return null; // SDK not used anymore
}

export function isContentstackConfigured(): boolean {
  return !!(contentstackConfig.apiKey && contentstackConfig.deliveryToken);
}

// GRABO-specific functions
export async function getPages() {
  try {
    const result = await getEntries('page');
    return result?.entries || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function getHeader() {
  try {
    const result = await getEntries('header');
    return result?.entries?.[0] || null;
  } catch (error) {
    console.error('Error fetching header:', error);
    return null;
  }
}

export async function getFooter() {
  try {
    const result = await getEntries('footer');
    return result?.entries?.[0] || null;
  } catch (error) {
    console.error('Error fetching footer:', error);
    return null;
  }
}

export async function getDisplayBanner() {
  try {
    // Use featured_coffee_section instead of display_banner since it doesn't exist
    const result = await fetchContentstackEntries('featured_coffee_section');
    return result?.entries?.[0] || null;
  } catch (error) {
    console.error('Error fetching display banner:', error);
    return null;
  }
}

// Function to get personalized featured coffee section based on user preference
/**
 * Get personalized featured section based on user preference and variant
 * @param userPreference - User's coffee preference
 * @param variantParam - Optional variant parameter from Personalize SDK
 * @returns Personalized featured section data
 */
export async function getPersonalizedFeaturedSection(
  userPreference: string = 'default',
  variantParam?: string
): Promise<any> {
  try {
    console.log('🎯 Fetching personalized featured section for preference:', userPreference);
    if (variantParam) {
      console.log('🎯 Using variant parameter for featured section personalization');
    }
    
    // Map user preferences to featured section UIDs
    // These correspond to hot/cold/cocoa audience segments
    const variantUIDs = {
      'hot': 'blt79acec116b1a8f16',      // Warm Comfort in Every Sip (hot coffee)
      'cold': 'blt190b7a996a7fedc0',     // Cool Brews, Bold Vibes (cold coffee)
      'mocha': 'blt45b819046c2772ff',    // For the Love of Cocoa (cocoa/mocha)
      'default': 'bltfdc6dd39ccd0271b'   // Our Crowd Favorites (default)
    };
    
    const selectedUID = variantUIDs[userPreference as keyof typeof variantUIDs] || variantUIDs.default;
    console.log('📡 Fetching featured section with UID:', selectedUID);
    
    // Fetch with personalization variant
    const featuredSection = await getEntry('featured_coffee_section', selectedUID, variantParam);
    
    if (featuredSection) {
      console.log('✅ Personalized featured section loaded:', featuredSection.title);
      console.log('🎯 User preference applied:', userPreference);
      console.log(`📋 Section has ${featuredSection.reference_menu_options?.length || 0} referenced cards`);
    }
    
    // Return as-is - the calling function will fetch the referenced cards
    return featuredSection;
  } catch (error) {
    console.error('❌ Error fetching personalized featured section:', error);
    return null;
  }
}

export async function getBlogPosts() {
  try {
    const result = await fetchContentstackEntries('blog_post');
    return result?.entries || [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await fetchContentstackEntries('card');
    return result !== null;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Get home page content
/**
 * Fetch Home page content with optional personalization
 * @param variantParam - Optional variant parameter for personalized content
 * @returns Home page data
 */
export async function getHomePageContent(variantParam?: string, userPreference?: string): Promise<HomePageData | null> {
  try {
    console.log('🏠 Fetching home page content...');
    if (variantParam) {
      console.log('🎯 Using variant parameter for personalization');
    }
    if (userPreference) {
      console.log('🎯 User has preference:', userPreference);
    }
    
    let homePageData: HomePageData = {};

    // First get the home page to find all references
    // Pass variantParam for personalized home page entry
    const homePage = await getEntry('page', 'bltdf4df875fbbf8358', variantParam);
    console.log('✅ Home page entry:', homePage);

    // Fetch hero banner from reference
    let heroBanner = null;
    if (homePage?.reference_hero_banner?.[0]?.uid) {
      const heroBannerUid = homePage.reference_hero_banner[0].uid;
      console.log('🎯 Fetching hero banner with UID:', heroBannerUid);
      heroBanner = await getHeroBanner(heroBannerUid, variantParam);
    }

    // Fetch story section from reference
    let storySection = null;
    if (homePage?.reference_story_section?.[0]?.uid) {
      const storyId = homePage.reference_story_section[0].uid;
      console.log('📖 Fetching story section with ID:', storyId);
      storySection = await getEntry('story_section', storyId, variantParam);
    }

    // Fetch featured coffee section based on personalization or home page reference
    let featuredSection = null;
    
    if (userPreference && userPreference !== 'default') {
      // User has a preference - fetch personalized featured section
      console.log('🎯 Fetching PERSONALIZED featured section for preference:', userPreference);
      featuredSection = await getPersonalizedFeaturedSection(userPreference, variantParam);
    } else if (homePage?.reference_featuredcoffee?.[0]?.uid) {
      // No user preference - use home page reference
      const featuredCoffeeUid = homePage.reference_featuredcoffee[0].uid;
      console.log('☕ Fetching featured coffee section from home page reference:', featuredCoffeeUid);
      featuredSection = await getEntry('featured_coffee_section', featuredCoffeeUid, variantParam);
    } else {
      // Fallback to default featured coffee section
      const defaultFeaturedUid = 'bltfdc6dd39ccd0271b';
      console.log('☕ Using default featured coffee section UID:', defaultFeaturedUid);
      featuredSection = await getEntry('featured_coffee_section', defaultFeaturedUid, variantParam);
    }
    
    // Fetch the actual referenced cards from the featured section
    if (featuredSection && featuredSection.reference_menu_options?.length > 0) {
      console.log('✅ Featured coffee section loaded:', featuredSection.title);
      console.log(`📋 Featured section references ${featuredSection.reference_menu_options.length} cards`);
      
      // Fetch each referenced card
      const cardPromises = featuredSection.reference_menu_options.map((ref: any) => 
        getEntry('card', ref.uid, variantParam)
      );
      
      const cardResults = await Promise.all(cardPromises);
      
      // Store the fetched cards
      const fetchedCards = cardResults.filter(card => card !== null);
      console.log(`✅ Fetched ${fetchedCards.length} referenced cards:`, fetchedCards.map((c: any) => c.title));
      
      // Keep the reference_menu_options but also store the full card data
      featuredSection.fetched_cards = fetchedCards;
    }

    // Fetch other content types with data
    // Pass variantParam for personalized content
    const footerResult = await fetchContentstackEntries('footer', variantParam);
    const footerData = footerResult?.entries?.[0];

    // Set hero banner from API (no fallbacks)
    homePageData.hero_banner = heroBanner ?? undefined;

    // Create about section using story_section data from API (no fallbacks)
    if (storySection) {
      console.log('✅ Using Reference-Story Section data from story_section:', storySection);
      console.log('📸 Story Section Image:', storySection.image);
      console.log('📸 Story Section Image URL:', storySection.image?.url);
      console.log('📝 Story Section Title:', storySection.title);
      console.log('📝 Story Section Content:', storySection.content);
      console.log('🔘 Story Section CTA Label:', storySection.cta_label);
      
      // Clean HTML content but preserve basic formatting
      const cleanContent = storySection.content ? sanitizeHtml(storySection.content) : '';
      
      homePageData.about_section = {
        title_h2: storySection.title || "",
        description: cleanContent || "",
        image: storySection.image || null,
        cta_label: storySection.cta_label || "",
        call_to_action: {
          title: storySection.cta_button?.title || "",
          href: storySection.cta_button?.href || ""
        }
      };
      
      console.log('✅ Final about_section created:', homePageData.about_section);
      console.log('📸 Final about_section image:', homePageData.about_section.image);
    } else {
      console.error('❌ No Reference-Story Section found in Contentstack');
      // No fallback - page will show empty about section if story section is missing
      homePageData.about_section = {
        title_h2: "",
        description: "",
        image: null,
        cta_label: "",
        call_to_action: {
          title: "",
          href: ""
        }
      };
    }

    // Use featured coffee section for services from API (no fallbacks)
    if (featuredSection && featuredSection.fetched_cards?.length > 0) {
      console.log('📋 Creating services_section from fetched cards');
      
      // Transform the already-fetched cards into services_section format
      const serviceCards = featuredSection.fetched_cards.map((cardResult: any) => {
        return {
          uid: cardResult.uid,
          title_h3: cardResult.title,
          description: (cardResult.know_your_coffee || '').replace(/<[^>]*>/g, '').trim(),
          icon: cardResult.image_of_coffee || cardResult.image,
          price: cardResult.price_of_coffee || cardResult.price,
          type: cardResult.type || 'default',  // ← ADD TYPE FIELD!
          call_to_action: {
            title: "Add to Cart",
            href: "#"
          }
        };
      });

      console.log(`✅ Created services_section with ${serviceCards.length} cards:`, 
        serviceCards.map((c: any) => `${c.title_h3} (₹${c.price}) [type: ${c.type}]`));

      homePageData.services_section = {
        title_h2: featuredSection.title || "",
        description: (featuredSection.section_description || "").replace(/<\/?p>/g, '').trim(),
        buckets: serviceCards
      };
    } else {
      console.error('❌ No featured coffee section or fetched cards found');
      // No fallback - page will show empty services section
      homePageData.services_section = {
        title_h2: "",
        description: "",
        buckets: []
      };
    }

    // Create testimonial section (static for now since testimony_section is empty)
    homePageData.testimonial_section = {
      caption: "Customer Reviews",
      title: "GRABO has completely transformed my coffee experience. From the moment I step in, I'm greeted with the perfect aroma and exceptional service.",
      user_name: "Sarah Johnson",
      user_title: "Coffee Enthusiast",
      user_image: { url: "/assets/images/home/user.jpg" }
    };

    // Use footer data for outro section if available
    homePageData.outro_section = {
      title_h2: "Visit GRABO Today",
      description: "Ready to experience the perfect cup of coffee? Visit us today and discover why GRABO is the preferred choice for coffee lovers.",
      address: footerData?.address?.location || "123 Brew Street, Downtown, Pune, 12345",
      phone: footerData?.address?.phone_number || "+1 (555) 987-6543",
      email: footerData?.address?.email || "support@grabo.coffee",
      call_to_action: {
        title: "Contact Us",
        href: "/contact"
      }
    };
    
    console.log('✅ Home page content loaded:', homePageData);
    return homePageData;
    
  } catch (error) {
    console.error('❌ Error fetching home page content:', error);
    return null;
  }
}

// Get outro section data
export async function getOutroSection(entryUid: string = 'blt69cfb68ab7d83e49'): Promise<any> {
  try {
    const outroEntry = await getEntry('outro_section', entryUid);
    return outroEntry;
  } catch (error) {
    console.error('Error fetching outro section:', error);
    return null;
  }
}

// Get Menu page content
export interface MenuPageData {
  title?: string;
  hero_banner?: HeroBanner;
  uid: string;
}

export async function getMenuPageContent(): Promise<MenuPageData | null> {
  try {
    console.log('📋 Fetching menu page content from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/page/entries/blta45f71e186f1dd88?include[]=reference_hero_banner`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Menu page API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const menuPage = data.entry;
    
    // Extract hero banner from reference
    let heroBanner = null;
    
    if (menuPage.reference_hero_banner && menuPage.reference_hero_banner.length > 0) {
      const heroBannerRef = menuPage.reference_hero_banner[0];
      if (heroBannerRef.uid) {
        const heroBannerData = await getHeroBanner(heroBannerRef.uid);
        heroBanner = heroBannerData;
      }
    }
    
    return {
      title: menuPage.title,
      hero_banner: heroBanner ?? undefined,
      uid: menuPage.uid
    };
    
  } catch (error) {
    console.error('❌ Error fetching menu page content:', error);
    return null;
  }
}

// Get About page content
export interface AboutPageData {
  title?: string;
  hero_banner?: HeroBanner;
  reference_cards?: MenuItem[];
  page_components?: any[];
  uid: string;
}

export async function getAboutPageContent(): Promise<AboutPageData | null> {
  try {
    console.log('📄 Fetching about page content from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/page/entries/bltf508a7b6ee1222cc`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 About page API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const aboutPage = data.entry;
    
    // Fetch hero banner from reference
    let heroBanner = null;
    if (aboutPage.reference_hero_banner && aboutPage.reference_hero_banner.length > 0) {
      const heroBannerRef = aboutPage.reference_hero_banner[0];
      if (heroBannerRef.uid) {
        console.log('🎯 Fetching hero banner with UID:', heroBannerRef.uid);
        heroBanner = await getHeroBanner(heroBannerRef.uid);
      }
    }
    
    // Fetch referenced cards (3 cards for horizontal scroll)
    let referencedCards: MenuItem[] = [];
    if (aboutPage.reference_cards && aboutPage.reference_cards.length > 0) {
      console.log(`🃏 Fetching ${aboutPage.reference_cards.length} referenced cards...`);
      const cardPromises = aboutPage.reference_cards.map(async (ref: any) => {
        try {
          const cardData = await getEntry('card', ref.uid);
          if (cardData) {
            return {
              id: cardData.uid,
              title: cardData.title || 'Untitled',
              description: (cardData.know_your_coffee || 'No description available').replace(/<[^>]*>/g, '').trim(),
              price: cardData.price_of_coffee ? `₹${cardData.price_of_coffee}` : '₹0',
              image: cardData.image_of_coffee?.url || '/assets/images/common/placeholder.jpg'
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching card ${ref.uid}:`, error);
          return null;
        }
      });
      
      const cards = await Promise.all(cardPromises);
      referencedCards = cards.filter(Boolean) as MenuItem[];
      console.log(`✅ Fetched ${referencedCards.length} cards for About page`);
    }
    
    return {
      title: aboutPage.title,
      hero_banner: heroBanner ?? undefined,
      reference_cards: referencedCards,
      page_components: aboutPage.page_components,
      uid: aboutPage.uid
    };
    
  } catch (error) {
    console.error('❌ Error fetching about page content:', error);
    return null;
  }
}

// Get Empty Cart Story Section
export interface EmptyCartStorySection {
  title?: string;
  content?: string;
  cta_button?: {
    title: string;
    href: string;
  };
  cta_label?: string;
  uid: string;
}

export async function getEmptyCartStorySection(): Promise<EmptyCartStorySection | null> {
  try {
    console.log('📖 Fetching empty cart story section from Contentstack...');
    const storySection = await getEntry('story_section', 'blt6744555b83149d46');
    
    if (!storySection) {
      console.warn('⚠️ No story section found');
      return null;
    }
    
    console.log('✅ Empty cart story section fetched:', storySection);
    
    return {
      title: storySection.title,
      content: storySection.content,
      cta_button: storySection.cta_button,
      cta_label: storySection.cta_label,
      uid: storySection.uid
    };
  } catch (error) {
    console.error('❌ Error fetching empty cart story section:', error);
    return null;
  }
}

// Get Track Order page content
export interface TrackOrderPageData {
  title?: string;
  hero_banner?: HeroBanner;
  story_section?: EmptyCartStorySection;
  uid: string;
}

export async function getTrackOrderPageContent(): Promise<TrackOrderPageData | null> {
  try {
    console.log('📦 Fetching track order page content from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    // Fetch the hero banner directly from blog_post
    const heroBannerUrl = `${baseUrl}/content_types/blog_post/entries/blt50d5577ebb360096`;
    console.log('📡 Fetching hero banner URL:', heroBannerUrl);
    
    const heroBannerResponse = await fetch(heroBannerUrl, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'branch': 'main',
        'Content-Type': 'application/json',
      },
    });

    if (!heroBannerResponse.ok) {
      throw new Error(`HTTP error! status: ${heroBannerResponse.status}`);
    }

    const heroBannerData = await heroBannerResponse.json();
    console.log('📦 Hero banner API response:', heroBannerData);
    
    let heroBanner = null;
    if (heroBannerData && heroBannerData.entry) {
      const entry = heroBannerData.entry;
      
      // Extract text from rich text fields
      const extractText = (richText: any): string => {
        if (!richText || !richText.children) return '';
        return richText.children.map((child: any) => {
          if (child.children) {
            return child.children.map((c: any) => c.text || '').join('');
          }
          return '';
        }).join('');
      };
      
      heroBanner = {
        banner_title: extractText(entry.hero_heading) || entry.title || '',
        banner_description: extractText(entry.hero_subheading) || '',
        banner_image: entry.hero_image || undefined
      };
    }

    // Fetch the page entry for story section
    const pageUrl = `${baseUrl}/content_types/page/entries/blt8341af221443f209`;
    console.log('📡 Fetching page URL:', pageUrl);
    
    const pageResponse = await fetch(pageUrl, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'branch': 'main',
        'Content-Type': 'application/json',
      },
    });

    let storySection = null;
    let pageTitle = '';
    let pageUid = '';
    
    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      console.log('📦 Page API response:', pageData);
      
      if (pageData && pageData.entry) {
        const trackOrderPage = pageData.entry;
        pageTitle = trackOrderPage.title;
        pageUid = trackOrderPage.uid;
        
        // Extract story section from reference
        if (trackOrderPage.reference_story_section && trackOrderPage.reference_story_section.length > 0) {
          const storySectionRef = trackOrderPage.reference_story_section[0];
          if (storySectionRef.uid) {
            const storySectionData = await getEntry('story_section', storySectionRef.uid);
            if (storySectionData) {
              storySection = {
                title: storySectionData.title,
                content: storySectionData.content,
                cta_button: storySectionData.cta_button,
                cta_label: storySectionData.cta_label,
                uid: storySectionData.uid
              };
            }
          }
        }
      }
    }
    
    return {
      title: pageTitle || 'Track Order',
      hero_banner: heroBanner ?? undefined,
      story_section: storySection ?? undefined,
      uid: pageUid || 'blt50d5577ebb360096'
    };
    
  } catch (error) {
    console.error('❌ Error fetching track order page content:', error);
    return null;
  }
}

// Get Cart page content
export async function getCartPageContent(): Promise<CartPageData | null> {
  try {
    console.log('🛒 Fetching cart page content from Contentstack...');
    console.log('API Config:', {
      apiKey: contentstackConfig.apiKey ? '✓ Set' : '✗ Missing',
      deliveryToken: contentstackConfig.deliveryToken ? '✓ Set' : '✗ Missing',
      environment: contentstackConfig.environment,
      baseUrl: contentstackConfig.baseUrl
    });
    
    // Fetch the shopping cart page entry with references
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/page/entries/blt6a3aff15372739ee?include[]=reference_hero_banner`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Full API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const cartPage = data.entry;
    console.log('✅ Cart page found!');
    console.log('Cart page data:', cartPage);
    
    // Extract hero banner from reference
    let heroBanner = null;
    
    if (cartPage.reference_hero_banner && cartPage.reference_hero_banner.length > 0) {
      console.log('📌 Found reference_hero_banner, fetching referenced content...');
      const heroBannerRef = cartPage.reference_hero_banner[0];
      
      // Fetch the referenced hero banner
      if (heroBannerRef.uid) {
        console.log('Fetching hero banner with UID:', heroBannerRef.uid);
        const heroBannerData = await getHeroBanner(heroBannerRef.uid);
        heroBanner = heroBannerData;
        console.log('✅ Hero banner fetched:', heroBanner);
      }
    } else if (cartPage.hero_banner) {
      console.log('📌 Found direct hero_banner field');
      if (Array.isArray(cartPage.hero_banner) && cartPage.hero_banner.length > 0) {
        heroBanner = cartPage.hero_banner[0];
      } else {
        heroBanner = cartPage.hero_banner;
      }
    } else {
      console.warn('⚠️ No hero_banner or reference_hero_banner found');
    }
    
    console.log('Final hero banner:', heroBanner);
    
    return {
      title: cartPage.title,
      hero_banner: heroBanner ?? undefined,
      page_description: cartPage.page_description,
      uid: cartPage.uid
    };
    
  } catch (error) {
    console.error('❌ Error fetching cart page content:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

// Get order summary data for cart page
export async function getOrderSummaryData(): Promise<OrderSummaryData | null> {
  try {
    console.log('📋 Fetching order summary data from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/coffee_cart/entries/blt06601bf2431725fb`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Order summary API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const orderSummary = data.entry;
    console.log('✅ Order summary data found:', orderSummary);
    
    return {
      title: orderSummary.title || "Order Summary",
      subtotal_label: orderSummary.subtotal_label || "Subtotal",
      delivery_fee_label: orderSummary.delivery_fee_label || "Delivery Fee",
      total_label: orderSummary.total_label || "Total",
      button: {
        button_label: orderSummary.button?.button_label || "Add More Items",
        add_more_items: {
          title: orderSummary.button?.add_more_items?.title || "",
          href: orderSummary.button?.add_more_items?.href || "/menu"
        }
      },
      button_2: {
        button_label: orderSummary.button_2?.button_label || "Place Order",
        place_order: {
          title: orderSummary.button_2?.place_order?.title || "",
          href: orderSummary.button_2?.place_order?.href || "/track-order"
        }
      },
      uid: orderSummary.uid
    };
  } catch (error) {
    console.error('❌ Error fetching order summary data:', error);
    return null;
  }
}

// Get order status data with referenced menu cards
export async function getOrderStatusData(): Promise<OrderStatusData | null> {
  try {
    console.log('📦 Fetching order status data from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/order_status/entries/bltdf375a43dcbb2ee8`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Order status API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const orderStatus = data.entry;
    console.log('✅ Order status data found:', orderStatus);
    
    // Fetch all referenced menu cards
    let availableMenuCards: MenuItem[] = [];
    if (orderStatus.group_item?.reference_menu_cards?.length > 0) {
      console.log('📋 Fetching referenced menu cards...');
      const cardPromises = orderStatus.group_item.reference_menu_cards.map(async (ref: any) => {
        try {
          const cardData = await getEntry('card', ref.uid);
          if (cardData) {
            return {
              uid: cardData.uid,
              title: cardData.title,
              image: cardData.image_of_coffee?.url || '',
              description: cardData.know_your_coffee || '',
              price: cardData.price || 0,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching card ${ref.uid}:`, error);
          return null;
        }
      });
      
      const cards = await Promise.all(cardPromises);
      availableMenuCards = cards.filter(Boolean) as MenuItem[];
      console.log('✅ Fetched menu cards:', availableMenuCards.length);
    }
    
    return {
      title: orderStatus.title || "Your Order",
      order_id_label: orderStatus.order_id || "Order Id : ",
      status: orderStatus.select || "Order Placed",
      available_menu_cards: availableMenuCards,
      uid: orderStatus.uid
    };
  } catch (error) {
    console.error('❌ Error fetching order status data:', error);
    return null;
  }
}

// Get review section data
export async function getReviewSectionData(): Promise<ReviewSectionData | null> {
  try {
    console.log('✍️ Fetching review section data from Contentstack...');
    const { apiKey, deliveryToken, baseUrl } = contentstackConfig;
    
    if (!apiKey || !deliveryToken) {
      console.log('Contentstack not configured, returning null');
      return null;
    }

    const url = `${baseUrl}/content_types/review_section/entries/blt2a5f169330556898`;
    console.log('📡 Fetching URL:', url);
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Review section API response:', data);
    
    if (!data || !data.entry) {
      console.warn('⚠️ No entry found in response');
      return null;
    }
    
    const reviewSection = data.entry;
    console.log('✅ Review section data found:', reviewSection);
    
    return {
      title: reviewSection.title || "Write a Review",
      rating_label: reviewSection.rating_label || "Rating",
      review_comment_label: reviewSection.review_comment_label || "Review Comment",
      submit_button: {
        title: reviewSection.submit_button?.title || "Submit Review",
        href: reviewSection.submit_button?.href || ""
      },
      cancel_button: {
        title: reviewSection.cancel_button?.title || "Cancel",
        href: reviewSection.cancel_button?.href || ""
      },
      uid: reviewSection.uid
    };
  } catch (error) {
    console.error('❌ Error fetching review section data:', error);
    return null;
  }
}

/**
 * Get hero banner with optional personalization
 * @param entryUid - Optional entry UID
 * @param variantParam - Optional variant parameter for personalized content
 * @returns Hero banner data
 */
export async function getHeroBanner(entryUid?: string, variantParam?: string): Promise<HeroBanner | null> {
  try {
    console.log('🎯 Fetching hero banner from blog_post...');
    if (variantParam) {
      console.log('🎯 Using variant parameter for hero banner personalization');
    }
    
    // Fetch the specific hero banner entry with personalization
    const heroBannerEntry = await getEntry('blog_post', entryUid || 'blt65f237f620aa24de', variantParam);
    
    const extractHero = (entry: any): HeroBanner | null => {
      if (!entry) return null;
      const heading =
        entry.hero_heading?.children?.[0]?.children?.[0]?.text ||
        entry.banner_title ||
        entry.title || '';
      const subheading =
        entry.hero_subheading?.children?.[0]?.children?.[0]?.text ||
        entry.banner_subtitle ||
        entry.subtitle || '';
      const description =
        entry.hero_description ||
        entry.banner_description ||
        entry.description || '';
      const imageUrl =
        entry.hero_image?.url ||
        entry.banner_image?.url ||
        entry.image?.url || '';
      const imageTitle =
        entry.hero_image?.title ||
        entry.banner_image?.title ||
        entry.image?.title || '';
      const ctaTitle = entry.hero_cta_link?.title || entry.call_to_action?.title || '';
      const ctaHref = entry.hero_cta_link?.href || entry.call_to_action?.href || '';

      if (!heading && !description && !imageUrl) return null;
      return {
        banner_title: heading || undefined,
        banner_subtitle: subheading || undefined,
        banner_description: description || undefined,
        banner_image: imageUrl ? { url: imageUrl, title: imageTitle } : undefined,
        call_to_action: ctaTitle || ctaHref ? { title: ctaTitle || 'Learn More', href: ctaHref || '#' } : undefined,
      };
    };

    if (heroBannerEntry) {
      const mapped = extractHero(heroBannerEntry);
      if (mapped) return mapped;
    }

    // Try a couple of plausible content types if the ID is from a different type
    const candidateTypes = ['hero_banner', 'banner', 'featured_coffee_section'];
    for (const type of candidateTypes) {
      try {
        const entry = await getEntry(type, entryUid || '');
        const mapped = extractHero(entry);
        if (mapped) {
          console.log(`✅ Hero banner resolved via content type: ${type}`);
          return mapped;
        }
      } catch (e) {
        // continue
      }
    }
    
    // Fallback: try to get from page components
    const homeContent = await getHomePageContent();
    return homeContent?.hero_banner || null;
    
  } catch (error) {
    console.error('❌ Error fetching hero banner:', error);
    return null;
  }
}