// TypeScript types for GRABO Coffee Shop

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  type?: string;
  prepTime?: string | null;
  link?: {
    title: string;
    url: string;
  };
  rawEntry?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentstackImage {
  uid: string;
  title: string;
  url: string;
  filename: string;
  content_type: string;
  file_size: string;
}

export interface ContentstackEntry {
  uid: string;
  title: string;
  image_of_coffee?: ContentstackImage;
  know_your_coffee?: string;
  price_of_coffee?: number;
  prep_time?: string | null;
  link?: {
    title: string;
    url: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface TestimonialItem {
  name: string;
  title: string;
  image: string;
  quote: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export interface OutroSection {
  title?: string;
  description?: string;
  location_details?: {
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  contact_details?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  working_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    general_hours?: string;
  };
  background_image?: ContentstackImage;
  call_to_action?: {
    title: string;
    href: string;
  };
}
