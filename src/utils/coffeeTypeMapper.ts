/**
 * Coffee Type Mapper Utility
 * Maps coffee names to standardized types for cart grouping
 */

export type CoffeeType = 'hot' | 'cold' | 'mocha';

/**
 * Mapping of coffee titles to their standardized types
 * Types: hot, cold, mocha
 */
const COFFEE_TYPE_MAP: Record<string, CoffeeType> = {
  // Mocha/Cocoa based coffees
  'Mocha': 'mocha',
  'Dark Cocoa Cold Brew': 'mocha',
  'Iced Cocoa Mocha': 'mocha',
  
  // Hot coffees
  'Espresso': 'hot',
  'Cappuccino': 'hot',
  'Latte': 'hot',
  
  // Cold coffees
  'Caramel Frappe': 'cold',
  'Iced Latte': 'cold',
  'Cold Coffee': 'cold'
};

/**
 * Get the standardized coffee type based on the coffee title
 * @param title - The coffee title/name
 * @returns The standardized type (hot, cold, or mocha)
 */
export const getCoffeeType = (title: string): CoffeeType | undefined => {
  // Try exact match first
  if (COFFEE_TYPE_MAP[title]) {
    return COFFEE_TYPE_MAP[title];
  }
  
  // Try case-insensitive match
  const normalizedTitle = title.trim();
  const matchedKey = Object.keys(COFFEE_TYPE_MAP).find(
    key => key.toLowerCase() === normalizedTitle.toLowerCase()
  );
  
  if (matchedKey) {
    return COFFEE_TYPE_MAP[matchedKey];
  }
  
  // Fallback: try to determine type from keywords in the title
  const lowerTitle = normalizedTitle.toLowerCase();
  
  if (lowerTitle.includes('mocha') || lowerTitle.includes('cocoa') || lowerTitle.includes('chocolate')) {
    return 'mocha';
  }
  
  if (lowerTitle.includes('iced') || lowerTitle.includes('cold') || lowerTitle.includes('frappe')) {
    return 'cold';
  }
  
  if (lowerTitle.includes('espresso') || lowerTitle.includes('cappuccino') || lowerTitle.includes('latte')) {
    return 'hot';
  }
  
  // Default to undefined if no match found
  return undefined;
};

/**
 * Get a display-friendly type label
 * @param type - The coffee type
 * @returns The display label
 */
export const getTypeLabel = (type: CoffeeType): string => {
  const labels: Record<CoffeeType, string> = {
    hot: '🔥 Hot',
    cold: '❄️ Cold',
    mocha: '🍫 Mocha'
  };
  
  return labels[type] || type;
};

/**
 * Group items by their coffee type
 * @param items - Array of items with titles
 * @returns Object with items grouped by type
 */
export const groupItemsByType = <T extends { title: string; type?: string }>(
  items: T[]
): Record<CoffeeType | 'other', T[]> => {
  const grouped: Record<CoffeeType | 'other', T[]> = {
    hot: [],
    cold: [],
    mocha: [],
    other: []
  };
  
  items.forEach(item => {
    const type = getCoffeeType(item.title);
    if (type) {
      grouped[type].push(item);
    } else {
      grouped.other.push(item);
    }
  });
  
  return grouped;
};

