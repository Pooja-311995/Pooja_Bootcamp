# 🎯 Product Requirements Document (PRD)
## GRABO Coffee Shop Web Application

---

## 📋 Document Information

| Field | Details |
|-------|---------|
| **Product Name** | GRABO - Coffee on Schedule |
| **Version** | 1.0 |
| **Last Updated** | October 13, 2025 |
| **Document Owner** | Product Team |
| **Status** | Active Development |
| **Tech Stack** | React, TypeScript, Contentstack CMS |

---

## 🎯 Executive Summary

### **Product Vision**

GRABO is a moThe platform emphasizes:

- **Speed**: Quick browsing and ordering
- **Personalization**: Tailored recommendations based on user preferences
- **Sustainability**: Promoting reusable cup usage
- **Quality**: Premium coffee sourced from Coorg and Chikmagalur

### **Target Audience**

- **Primary**: Busy professionals aged 25-45
- **Secondary**: Coffee enthusiasts seeking quality beverages
- **Location**: Urban areas, downtown business districts

### **Key Differentiators**

1. **AI-Powered Personalization**: Menu adapts based on first order
2. **Headless CMS Integration**: Real-time content updates via Contentstack
3. **Order Tracking**: Live status updates with timer-based progression
4. **Sustainability Focus**: Encouraging eco-friendly practices

---

## 📊 Product Goals & Objectives

### **Business Goals**

| Goal | Success Metric | Target |
|------|----------------|--------|
| Increase online orders | Orders per day | 100+ daily orders |
| Reduce ordering time | Average order time | < 2 minutes |
| Improve customer retention | Repeat order rate | 40% within 30 days |
| Enhance personalization accuracy | Personalization match rate | 80% accuracy |
| Boost sustainability | Reusable cup adoption | 30% of orders |

### **User Goals**

- Place coffee orders quickly (< 2 minutes)
- Discover new coffee options based on preferences
- Track order status in real-time
- Manage cart and order history easily
- Access on any device (responsive design)

---

## 🏗️ Product Architecture

### **System Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                  (React SPA - TypeScript)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────┐
                              │                     │
                              ▼                     ▼
┌──────────────────────────────────┐  ┌──────────────────────┐
│   Contentstack CMS (Headless)    │  │  Personalize SDK     │
│   - Content Delivery API         │  │  - User Preferences  │
│   - Live Preview                 │  │  - Audience Targeting│
│   - REST API                     │  │  - Variant Delivery  │
└──────────────────────────────────┘  └──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Email Automation (Webhooks)                    │
│               - Order Confirmations                          │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Framework |
| **Styling** | CSS3 + Custom Styles | Design System |
| **State Management** | React Context API | Global State |
| **CMS** | Contentstack | Content Management |
| **Personalization** | Contentstack Personalize | User Targeting |
| **Build Tool** | Webpack (CRA) | Bundling |
| **Package Manager** | npm | Dependencies |
| **Notifications** | Custom Toast System | User Feedback |

---

## 🎨 Core Features & Functionality

### **1. Home Page**

#### **1.1 Hero Section**

**Purpose**: Create strong first impression and showcase brand identity

**Content**:
- Dynamic hero banner with background image/video
- Prominent headline and subtitle
- Call-to-action button ("Order Now")

**CMS Integration**:
- Content Type: `blog_post` (hero banner)
- Fields: `title`, `subtitle`, `description`, `background_image`, `background_video`
- API Endpoint: `/v3/content_types/blog_post/entries/{uid}`

**Technical Requirements**:
- Responsive images with fallback
- Video background support (MP4)
- Lazy loading for performance
- Accessibility: proper heading hierarchy

---

#### **1.2 Story Section**

**Purpose**: Communicate brand values and mission

**Content**:
- Section title
- Rich text description
- Feature image
- CTA button ("Explore Our Menu")

**Design Requirements**:
- **Text Color**: Lightest cream (`#F5F5DC`)
- **Font**: Google Fonts (Playfair Display / Montserrat)
- **Font Size**: 1.1rem for body text
- **Alignment**: Justified text
- **Layout**: Flexbox with image and text side-by-side
- **Spacing**: Proper padding between elements

**CMS Integration**:
- Content Type: `story_section`
- Fields: `title`, `content` (rich text), `image`, `cta_label`, `cta_button`
- Dynamic HTML rendering via `dangerouslySetInnerHTML`

---

#### **1.3 Featured Coffee Section** (Personalized)

**Purpose**: Showcase curated coffee selections based on user preferences

**Behavior**:

| User State | Featured Section Displayed |
|-----------|----------------------------|
| **First-time visitor** | "Our Crowd Favorites" |
| **After ordering hot coffee** | "Warm Comfort in Every Sip" |
| **After ordering cold coffee** | "Cool Brews, Bold Vibes" |
| **After ordering cocoa/mocha** | "For the Love of Cocoa" |

**Content**:
- Section title and description
- 3 coffee cards with:
  - Coffee image
  - Name and description
  - Price (₹)
  - "Add to Cart" button
  - Coffee type badge (Hot 🔥 / Cold 🧊 / Mocha 🍫)

**Personalization Logic**:

```javascript
// Step 1: User places first order
Order: Cappuccino (type: "hot")

// Step 2: Preference determined
determineUserPreference() → "hot"

// Step 3: Preference saved
localStorage: { userPreference: "hot" }

// Step 4: Next visit to Home page
getHomePageContent(variantParam, "hot")

// Step 5: Fetch personalized section
getPersonalizedFeaturedSection("hot")
  → UID: blt79acec116b1a8f16
  → Section: "Warm Comfort in Every Sip"
  → Cards: Espresso, Latte, Cappuccino

// Step 6: Display on Home page
Featured Section: ✅ "Warm Comfort in Every Sip"
```

**CMS Integration**:
- Content Type: `featured_coffee_section`
- Fields: `title`, `section_description`, `reference_menu_options[]`
- Referenced Content Type: `card` (coffee items)
- Card Fields: `title`, `image_of_coffee`, `price_of_coffee`, `know_your_coffee`, `type`

**Technical Requirements**:
- Fetch featured section based on user preference
- Fetch all referenced cards dynamically
- Transform card data to MenuItem format
- Include `type` field for personalization tracking
- Display using `MenuCard` component
- Handle "Add to Cart" functionality

---

#### **1.4 Outro Section**

**Purpose**: Provide contact information and encourage action

**Content**:
- Section title ("Visit GRABO Today")
- Descriptive text
- Address, phone, email
- "Contact Us" CTA button

**CMS Integration**:
- Content Type: `footer`
- Fields: `address.location`, `address.phone_number`, `address.email`

---

### **2. Menu Page**

#### **2.1 Hero Section**

**Purpose**: Set context and highlight menu offerings

**Content**:
- Page title
- Subtitle
- Background image

**Design Requirements**:
- **Text Color**: Lightest cream (`#F5F5DC`)
- **Text Shadow**: Strong shadows for readability
- **Font Weight**: Bold titles
- **Background Position**: Adjusted for better text visibility

**CMS Integration**:
- Content Type: `blog_post`
- Entry UID: `blta2f3f16d633434f7`

---

#### **2.2 Featured Section** (Context-Aware)

**Purpose**: Display personalized recommendations when available

**Behavior**:

| Personalization State | Section Displayed |
|----------------------|-------------------|
| **No personalization** | "Our Crowd Favorites" (default) |
| **Hot preference** | "Warm Comfort in Every Sip" |
| **Cold preference** | "Cool Brews, Bold Vibes" |
| **Mocha preference** | "For the Love of Cocoa" |

**Content**:
- Same structure as Home page featured section
- 3 cards with coffee items

**Technical Requirements**:
- Check user preference from `OrderContext`
- Fetch appropriate featured section
- Display between hero and main menu
- Use `MenuCard` component for consistency

---

#### **2.3 Main Menu Grid**

**Purpose**: Display all available coffee items for ordering

**Content**:
- Grid layout of coffee cards
- Each card displays:
  - Coffee image
  - Name
  - Description
  - Price
  - Coffee type badge
  - "Add to Cart" button

**Filtering Rules**:
- Only display cards with valid `price_of_coffee`
- Exclude informational cards (no price)

**CMS Integration**:
- Content Type: `card`
- Query: Fetch all entries with `price_of_coffee` field
- Fields: `title`, `image_of_coffee`, `price_of_coffee`, `know_your_coffee`, `type`

**Coffee Type Mapping**:

| Coffee Name | Type | Badge |
|------------|------|-------|
| Espresso | `hot` | 🔥 Hot |
| Latte | `hot` | 🔥 Hot |
| Cappuccino | `hot` | 🔥 Hot |
| Cold Coffee | `cold` | 🧊 Cold |
| Iced Latte | `cold` | 🧊 Cold |
| Caramel Frappe | `cold` | 🧊 Cold |
| Mocha | `mocha` | 🍫 Mocha |
| Dark Cocoa Cold Brew | `mocha` | 🍫 Mocha |
| Iced Cocoa Mocha | `mocha` | 🍫 Mocha |

**Technical Requirements**:
- Responsive grid layout (3 columns → 2 → 1)
- Filter cards by price validity
- Map coffee types using `coffeeTypeMapper.ts`
- Update menu dynamically when personalization changes
- localStorage event listener for preference updates

---

### **3. Cart Page**

#### **3.1 Hero Section**

**Purpose**: Provide context for cart page

**CMS Integration**:
- Content Type: `blog_post`
- Entry UID: `bltb4ce5f3e3beaf2bf`

---

#### **3.2 Cart Items List**

**Purpose**: Display items user has added to cart

**Content**:
- List of cart items with:
  - Coffee image
  - Name
  - Description
  - Unit price
  - Quantity controls (-, +, X)
  - Line total
  - **Type badge** (Hot 🔥 / Cold 🧊 / Mocha 🍫)

**Functionality**:
- **Increase quantity**: `+` button
- **Decrease quantity**: `-` button (removes if quantity = 0)
- **Remove item**: `X` button
- **Real-time total calculation**

**State Management**:
- Context: `CartContext`
- Actions: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`

---

#### **3.3 Empty Cart State**

**Purpose**: Encourage action when cart is empty

**Content**:
- Title: "Your Cart is Empty"
- Rich text message with brand story
- "Browse Menu" CTA button

**CMS Integration**:
- Content Type: `story_section`
- Entry UID: `blt1feebdad4a2caaf3`
- Field: `content` (rich text HTML)

---

#### **3.4 Order Summary**

**Purpose**: Display order totals and place order

**Content**:
- Subtotal
- Tax
- Total
- "Place Order" button

**CMS Integration**:
- Content Type: `card_order_summary`
- Entry UID: `blt06601bf2431725fb`
- Fields: All labels (`subtotal_label`, `tax_label`, `total_label`, `place_order_button_text`)

**Technical Requirements**:
- Dynamic calculation based on cart items
- All text from Contentstack (no hardcoded strings)
- Trigger order placement on button click

---

#### **3.5 Order Placement Flow**

**Process**:

```
1. User clicks "Place Order"
   ↓
2. Validate cart is not empty
   ↓
3. Generate random order ID (ORD-XXXXX)
   ↓
4. Determine user preference (hot/cold/mocha) if first order
   ↓
5. Create order object with:
   - Order ID
   - Items (with type field)
   - Total
   - Timestamp
   - Status: "Order Placed"
   ↓
6. Save to OrderContext
   ↓
7. Send email confirmation (Contentstack Automation API)
   ↓
8. Clear cart
   ↓
9. Set audience attributes (Personalize SDK) if applicable
   ↓
10. Navigate to Track Order page
   ↓
11. Show success notification
```

**Email Automation**:

**Service**: `emailService.ts`

**Webhook URL**: Contentstack Automation Webhook

**Email Content**:
- Order confirmation header
- Order ID
- Item list with quantities and prices
- Total amount
- Brand message (sustainability focus)
- Contact information

**Format**:
- Plain text with line breaks (`\n`)
- Proper spacing between sections
- No HTML markup

**Technical Implementation**:
```typescript
const emailBody = `
Hi Customer,

Thanks for choosing Grabo — your coffee is now officially on schedule!

We've received your order #${orderId} and our team is already preparing it with care.

ORDER DETAILS

${items.map(item => 
  `${index + 1}. ${item.title}
   Quantity: ${item.quantity}
   Price: ₹${item.price} x ${item.quantity} = ₹${lineTotal}`
).join('\n\n')}

TOTAL AMOUNT: ₹${total}

At Grabo, we believe in:
☕ Coffee on schedule
✨ Quality in every cup
🌱 Sustainability through our reusable cups initiative

Every sip helps save the planet!

Warmly,
Team Grabo
`;
```

---

### **4. Track Order Page**

#### **4.1 Hero Section**

**Purpose**: Provide context for order tracking

**CMS Integration**:
- Content Type: `blog_post`
- Entry UID: `blt50d5577ebb360096`
- Fields: `title`, `subtitle`, `content` (rich text)

---

#### **4.2 Order Status Timeline**

**Purpose**: Show real-time order progress

**Status Flow**:

| Status | Duration | Next Status |
|--------|----------|-------------|
| **Order Placed** | 5 seconds | Preparing |
| **Preparing** | 5 seconds | Ready For Pick-Up |
| **Ready For Pick-Up** | 15 seconds | Picked |
| **Picked** | Final | - |

**Visual Design**:
- Timeline with checkmarks
- Current status highlighted
- Progress indicators
- Timer countdown

**CMS Integration**:
- Content Type: `blog_post` (order status)
- Entry UID: `bltdf375a43dcbb2ee8`
- Fields: Status labels and descriptions

**Technical Implementation**:
```typescript
useEffect(() => {
  let timer: NodeJS.Timeout;
  
  const durations = {
    'Order Placed': 5000,      // 5 seconds
    'Preparing': 5000,          // 5 seconds
    'Ready For Pick-Up': 15000, // 15 seconds
    'Picked': 5000              // 5 seconds (final)
  };
  
  timer = setTimeout(() => {
    updateOrderStatus(orderId, nextStatus);
  }, durations[currentStatus]);
  
  return () => clearTimeout(timer);
}, [currentStatus]);
```

---

#### **4.3 Order Items Display**

**Purpose**: Show ordered items as menu-style cards

**Content**:
- Grid of coffee cards (same as Menu page)
- Each card displays:
  - Coffee image
  - Name
  - Price
  - Type badge
  - Quantity indicator

**Technical Requirements**:
- Fetch full menu items from Contentstack
- Filter to show only items in current order
- Display using `MenuCard` component (without "Add to Cart")
- Maintain consistent design with Menu page

---

#### **4.4 Order History** (Limited)

**Purpose**: Show recent order history

**Display Rules**:
- **Show**: Current order + Last order (max 2 orders)
- **Hide**: All older orders

**Content per Order**:
- Order ID
- Order date
- Status
- Total amount
- Items ordered

**Technical Implementation**:
```typescript
const displayOrders = orders.slice(0, 2); // Only first 2 orders
```

---

#### **4.5 No Orders State**

**Purpose**: Guide users when no orders exist

**Content**:
- Title: "No Orders Yet"
- Rich text message
- "Browse Menu" CTA button

**CMS Integration**:
- Content Type: `story_section`
- Entry UID: `blt1feebdad4a2caaf3`

---

#### **4.6 Write Review Modal**

**Purpose**: Collect customer feedback

**Trigger**: "Write Review" button (visible when order status = "Picked")

**Content**:
- Modal overlay
- Star rating selector (1-5 stars)
- Text area for review
- "Submit" and "Cancel" buttons

**CMS Integration**:
- Content Type: `review_section`
- Entry UID: `blt2a5f169330556898`
- Fields: All labels and button texts

**Validation**:
- Require at least 1 star selected
- Review text optional
- Show error if submitting with 0 stars

**Technical Requirements**:
- Interactive star selection (hover + click)
- Default: No stars selected
- Reset to 0 stars on submit/cancel
- Display text: "No rating selected" when 0 stars
- Save review to order in `OrderContext`

**Design**:
- Modern, clean aesthetic
- Smooth animations
- Coffee-themed colors
- Responsive layout

---

### **5. About Page**

#### **5.1 Hero Section**

**Purpose**: Introduce GRABO brand and mission

**Content**:
- Title: "About Us"
- Subtitle
- Description
- Background video

**Design Requirements**:
- **Text Color**: Lightest cream (`#F5F5DC`)
- **Text Shadow**: Strong shadows for readability over video
- Video background (MP4)

**CMS Integration**:
- Content Type: `page`
- Entry UID: `bltf508a7b6ee1222cc`
- Nested Content: `page_components.section_with_html_code[]`

**Technical Requirements**:
- `<video>` element with autoplay, loop, muted
- Fallback to static image if video fails
- Proper z-index layering

---

#### **5.2 Information Cards Banner**

**Purpose**: Communicate key brand values

**Content**:
- Section title: "What Grabo Is?"
- 3 horizontal scrollable cards:
  1. Mission statement
  2. Quality & sustainability message
  3. Additional information

**Card Structure**:
- Title
- Rich text description
- Optional image/HTML content

**Design Requirements**:
- Horizontal scroll (overflow-x: auto)
- Cards wider than viewport
- No price or "Add to Cart" button
- Consistent with menu cards design

**CMS Integration**:
- Content Type: `page` → `page_components`
- Nested: `section_with_html_code[]`
- Fields: `title`, `description`, `html_code`

**Technical Requirements**:
- Render rich text via `dangerouslySetInnerHTML`
- Horizontal scroll container
- Responsive card width
- Smooth scrolling

---

#### **5.3 Hero CTA Button**

**Purpose**: Drive action from About page

**Behavior**:
- Button text: "Order Now" (or custom from CMS)
- Links to: Home page (`/`)

**Note**: "Order Now" tab removed from global header as requested

---

### **6. Global Components**

#### **6.1 Header**

**Content**:
- Logo (links to Home)
- Navigation links:
  - **Home**
  - **Menu** (bold weight)
  - **About**
  - **Track Order**
- Cart icon with item count badge

**Design Requirements**:
- "Menu" text: **Bold** font weight
- Sticky header on scroll
- Responsive: Hamburger menu on mobile

**Technical Requirements**:
- `useCart` context for cart count
- Active link highlighting
- React Router `Link` components

---

#### **6.2 Footer**

**Content**:
- Brand name
- Address
- Phone
- Email
- Social links (optional)
- Copyright text

**CMS Integration**:
- Content Type: `footer`
- Fields: `address.location`, `address.phone_number`, `address.email`

---

#### **6.3 Notification System**

**Purpose**: Provide user feedback for actions

**Types**:
- **Success**: Item added to cart, order placed
- **Error**: Action failed
- **Info**: General information

**Features**:
- Auto-dismiss after 5 seconds
- Manual close button
- "View Cart" button (for cart notifications)
- Image thumbnail for cart items
- Toast-style positioning (top-right)

**Technical Implementation**:
- Context: `NotificationContext`
- Component: Custom toast notifications
- Queue: Multiple notifications supported

**Content Structure**:
```typescript
interface Notification {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  itemName?: string;
  itemImage?: string;
  showCartButton?: boolean;
}
```

---

#### **6.4 Menu Card Component**

**Purpose**: Reusable coffee item card

**Props**:
```typescript
interface MenuCardProps {
  item: MenuItem;
  onOrderClick?: (item: MenuItem) => void;
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: string; // e.g., "₹79"
  image: string;
  type?: string; // "hot" | "cold" | "mocha"
}
```

**Content**:
- Coffee image
- Title
- Description
- Price
- Type badge (conditional)
- "Add to Cart" button

**Behavior**:
- Parse price string to number
- Dispatch `ADD_ITEM` to CartContext
- Show success notification
- Include `type` field in cart item

**Design**:
- Card with shadow
- Hover effects
- Responsive image
- Consistent spacing

---

### **7. Personalization System**

#### **7.1 User Preference Determination**

**Purpose**: Identify user's coffee preference from first order

**Logic**:

```typescript
// Count coffee types in order
const typeCounts = { hot: 0, cold: 0, mocha: 0 };

items.forEach(item => {
  const type = item.type?.toLowerCase();
  if (type === 'hot') typeCounts.hot++;
  else if (type === 'cold') typeCounts.cold++;
  else if (type === 'mocha' || type === 'cocoa') typeCounts.mocha++;
});

// Return dominant type
const maxCount = Math.max(typeCounts.hot, typeCounts.cold, typeCounts.mocha);

if (typeCounts.mocha === maxCount) return 'mocha';
if (typeCounts.cold === maxCount) return 'cold';
if (typeCounts.hot === maxCount) return 'hot';

return 'default';
```

**Trigger**: First order placement

**Storage**: `localStorage` → `graboOrders` → `userPreference`

---

#### **7.2 Featured Section Selection**

**Mapping**:

| User Preference | Featured Section UID | Section Title |
|----------------|---------------------|---------------|
| `default` | `bltfdc6dd39ccd0271b` | Our Crowd Favorites |
| `hot` | `blt79acec116b1a8f16` | Warm Comfort in Every Sip |
| `cold` | `blt190b7a996a7fedc0` | Cool Brews, Bold Vibes |
| `mocha` | `blt45b819046c2772ff` | For the Love of Cocoa |

**Implementation**:

```typescript
export async function getPersonalizedFeaturedSection(
  userPreference: string = 'default',
  variantParam?: string
): Promise<any> {
  const variantUIDs = {
    'hot': 'blt79acec116b1a8f16',
    'cold': 'blt190b7a996a7fedc0',
    'mocha': 'blt45b819046c2772ff',
    'default': 'bltfdc6dd39ccd0271b'
  };
  
  const selectedUID = variantUIDs[userPreference] || variantUIDs.default;
  return await getEntry('featured_coffee_section', selectedUID, variantParam);
}
```

---

#### **7.3 Contentstack Personalize SDK** (Optional Enhancement)

**Purpose**: Advanced audience targeting and A/B testing

**Features**:
- Audience segmentation
- Variant delivery
- User attribute management
- State persistence

**Attributes**:

| Attribute Name | Values | Purpose |
|---------------|--------|---------|
| Cocoa Brew | `cocoabrew` | Target mocha coffee lovers |
| Hot Brew | `hotbrew` | Target hot coffee lovers |
| Cold Brew | `coldbrew` | Target cold coffee lovers |

**Integration**:
- SDK: `@contentstack/personalize-edge-sdk`
- Context: `PersonalizeContext`
- Storage: `localStorage` (state persistence)

**Flow**:

```
1. User places order
   ↓
2. Determine coffee preference (hot/cold/mocha)
   ↓
3. Map to audience attribute
   hot → "Hot Brew" = "hotbrew"
   cold → "Cold Brew" = "coldbrew"
   mocha → "Cocoa Brew" = "cocoabrew"
   ↓
4. Set attribute via Personalize SDK
   personalizeSdk.setUserAttributes({ attributeName: attributeValue })
   ↓
5. Next page load
   ↓
6. Get variant parameter
   variantParam = personalizeSdk.getVariantParam()
   ↓
7. Fetch content with variant
   getEntry('featured_coffee_section', uid, variantParam)
   ↓
8. Contentstack returns personalized content
```

---

### **8. Content Management System**

#### **8.1 Contentstack Setup**

**Type**: Headless CMS

**API**: REST API (Delivery API)

**Authentication**:
- API Key: `bltb34bfa72850a449c`
- Access Token: `csa6deb56c24d904c40904f739`
- Environment: `blt38624c026d2cc447`

**Base URL**: `https://cdn.contentstack.io/v3`

---

#### **8.2 Content Types**

| Content Type | Purpose | Key Fields |
|-------------|---------|------------|
| `page` | Page structure | `title`, `url`, `reference_hero_banner`, `reference_story_section`, `reference_featuredcoffee` |
| `blog_post` | Hero banners | `title`, `subtitle`, `description`, `background_image`, `background_video`, `content` |
| `card` | Coffee menu items | `title`, `image_of_coffee`, `price_of_coffee`, `know_your_coffee`, `type` |
| `featured_coffee_section` | Featured collections | `title`, `section_description`, `reference_menu_options[]` |
| `story_section` | Content sections | `title`, `content`, `image`, `cta_label`, `cta_button` |
| `card_order_summary` | Order summary labels | `subtotal_label`, `tax_label`, `total_label`, `place_order_button_text` |
| `review_section` | Review modal | `modal_title`, `rating_label`, `review_label`, `submit_button_text`, `cancel_button_text` |
| `footer` | Footer content | `address.location`, `address.phone_number`, `address.email` |

---

#### **8.3 API Integration**

**Fetch Entry**:
```typescript
async function getEntry(
  contentType: string,
  uid: string,
  variantParam?: string
): Promise<any> {
  const variantQuery = variantParam 
    ? `?variants=${encodeURIComponent(variantParam)}`
    : '';
    
  const url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/${uid}${variantQuery}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': API_KEY,
      'access_token': ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.entry;
}
```

**Fetch All Entries**:
```typescript
async function fetchContentstackEntries(
  contentType: string,
  variantParam?: string
): Promise<any> {
  const variantQuery = variantParam 
    ? `?variants=${encodeURIComponent(variantParam)}`
    : '';
    
  const url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries${variantQuery}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': API_KEY,
      'access_token': ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
```

---

#### **8.4 Live Preview**

**Purpose**: Real-time content updates during editing

**SDK**: `@contentstack/live-preview-utils`

**Configuration**:
```typescript
ContentstackLivePreview.init({
  ssr: false,
  enable: true,
  stackSdk: null, // Using REST API
  clientUrlParams: {
    host: 'app.contentstack.com'
  }
});
```

**Usage**: Automatic content updates when editing in Contentstack

---

### **9. State Management**

#### **9.1 Context Structure**

| Context | Purpose | State |
|---------|---------|-------|
| `CartContext` | Shopping cart | `items[]`, `total` |
| `OrderContext` | Order management | `orders[]`, `currentOrder`, `userPreference`, `isFirstOrder` |
| `NotificationContext` | User notifications | `notifications[]` |
| `PersonalizeContext` | Personalization | `personalizeSdk`, `isInitialized`, `variantParam` |

---

#### **9.2 Cart Context**

**State**:
```typescript
interface CartState {
  items: CartItem[];
  total: number;
}

interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  type?: string; // "hot" | "cold" | "mocha"
}
```

**Actions**:
- `ADD_ITEM`: Add item or increase quantity
- `REMOVE_ITEM`: Remove item completely
- `UPDATE_QUANTITY`: Change item quantity
- `CLEAR_CART`: Empty cart

---

#### **9.3 Order Context**

**State**:
```typescript
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  userPreference: string;
  isFirstOrder: boolean;
}

interface Order {
  id: string; // e.g., "ORD-QW9W5P"
  items: OrderItem[];
  total: number;
  status: 'Order Placed' | 'Preparing' | 'Ready For Pick-Up' | 'Picked';
  orderDate: Date;
  estimatedDelivery: Date;
  review?: {
    rating: number;
    comment: string;
  };
}
```

**Actions**:
- `PLACE_ORDER`: Create new order
- `UPDATE_ORDER_STATUS`: Progress order status
- `ADD_REVIEW`: Save customer review

**Persistence**: `localStorage` → `graboOrders`

---

### **10. User Flows**

#### **10.1 First-Time User Journey**

```
1. User visits Home page
   → Sees: "Our Crowd Favorites" (default)
   → 3 cards: Cappuccino, Cold Coffee, Dark Cocoa Cold Brew
   
2. User clicks "Add to Cart" on Cappuccino
   → Item added with type: "hot"
   → Success notification shown
   → Cart badge updates to "1"
   
3. User clicks Cart icon
   → Navigates to Cart page
   → Sees: Cappuccino with HOT badge 🔥
   → Order summary shows: ₹79
   
4. User clicks "Place Order"
   → Order ID generated: ORD-XXXXX
   → Preference determined: "hot"
   → Email sent with order confirmation
   → Navigates to Track Order page
   → Status: "Order Placed"
   
5. Order auto-progresses:
   - 5s → "Preparing"
   - 5s → "Ready For Pick-Up"
   - 15s → "Picked"
   → "Write Review" button appears
   
6. User returns to Home page
   → Featured section changed!
   → Now shows: "Warm Comfort in Every Sip"
   → Cards: Espresso, Latte, Cappuccino
   → ✅ Personalization active!
```

---

#### **10.2 Repeat User Journey**

```
1. User visits Home page
   → Sees personalized featured section
   → Based on previous preference
   
2. User clicks "Menu"
   → Also shows personalized featured section at top
   → Full menu below
   
3. User adds items from personalized section
   → Preference reinforced
   
4. User places order
   → Faster flow (already knows interface)
   → Email confirmation sent
   
5. User tracks order
   → Sees current order + last order (max 2)
   → Can write review when order picked
```

---

### **11. Design System**

#### **11.1 Color Palette**

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Brown** | `#6F4E37` | Buttons, accents |
| **Light Cream** | `#F5F5DC` | Text on dark backgrounds |
| **Dark Gray** | `#2C3E50` | Body text |
| **White** | `#FFFFFF` | Backgrounds |
| **Success Green** | `#4CAF50` | Success notifications |
| **Error Red** | `#F44336` | Error notifications |

**Coffee Type Badge Colors**:
- Hot: Orange/Red gradient (`#FF6B35`)
- Cold: Blue gradient (`#4A90E2`)
- Mocha: Brown gradient (`#6F4E37`)

---

#### **11.2 Typography**

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **Hero Title** | Playfair Display | 3rem | Bold (700) |
| **Section Title** | Montserrat | 2rem | Bold (700) |
| **Body Text** | Montserrat | 1rem | Regular (400) |
| **Card Title** | Montserrat | 1.5rem | Semi-Bold (600) |
| **Story Text** | Montserrat | 1.1rem | Regular (400) |
| **Button Text** | Montserrat | 1rem | Bold (700) |

**Google Fonts Import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
```

---

#### **11.3 Component Styling**

**Buttons**:
- Primary: Brown background, white text
- Hover: Darker brown
- Border-radius: 8px
- Padding: 12px 24px
- Transition: 0.3s ease

**Cards**:
- White background
- Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
- Border-radius: 12px
- Hover: Lift effect (translateY(-4px))

**Input Fields**:
- Border: 1px solid #ddd
- Border-radius: 4px
- Focus: Primary color border
- Padding: 10px 12px

---

### **12. Responsive Design**

#### **12.1 Breakpoints**

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| **Mobile** | < 768px | 1 column |
| **Tablet** | 768px - 1024px | 2 columns |
| **Desktop** | > 1024px | 3 columns |

#### **12.2 Mobile Considerations**

- Hamburger menu for navigation
- Stacked layout for hero sections
- Full-width cards on mobile
- Touch-friendly button sizes (min 44px)
- Optimized images for mobile bandwidth

---

### **13. Performance Requirements**

#### **13.1 Loading Time**

| Page | Target Load Time | Max Load Time |
|------|------------------|---------------|
| Home | < 2s | < 3s |
| Menu | < 2s | < 3s |
| Cart | < 1s | < 2s |
| Track Order | < 1s | < 2s |

#### **13.2 Optimization Strategies**

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format, responsive images
- **Bundle Size**: < 250KB (gzipped)
- **Caching**: Service worker for offline support (future)
- **API**: Minimize API calls, use caching

#### **13.3 Current Bundle Size**

```
Main Bundle: 232.71 KB (gzipped)
CSS Bundle: 5.85 KB
Total: ~238 KB
```

---

### **14. Browser Support**

| Browser | Minimum Version | Support Level |
|---------|----------------|---------------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |
| Mobile Safari | 14+ | Full |
| Chrome Mobile | 90+ | Full |

**Progressive Enhancement**:
- Core functionality works on older browsers
- Enhanced features (animations, transitions) on modern browsers

---

### **15. Accessibility (A11y)**

#### **15.1 WCAG 2.1 Compliance**

**Target**: Level AA

**Requirements**:
- Semantic HTML (h1-h6, nav, main, footer)
- Alt text for all images
- Keyboard navigation support
- Focus indicators visible
- Color contrast ratio ≥ 4.5:1
- ARIA labels for interactive elements

#### **15.2 Implementation**

```tsx
// Semantic HTML
<main role="main">
  <section aria-labelledby="featured-title">
    <h2 id="featured-title">Featured Coffee</h2>
  </section>
</main>

// Accessible buttons
<button 
  aria-label="Add Cappuccino to cart"
  onClick={handleAddToCart}
>
  Add to Cart
</button>

// Alt text for images
<img 
  src={coffee.image} 
  alt={`${coffee.title} - ${coffee.description}`} 
/>
```

---

### **16. Testing Requirements**

#### **16.1 Unit Testing**

**Coverage Target**: > 80%

**Test Cases**:
- Component rendering
- State updates (context reducers)
- API response handling
- Utility functions (type mapping, price parsing)

#### **16.2 Integration Testing**

**Scenarios**:
- Add item to cart → Place order → Track order
- Personalization flow (first order → preference → featured section)
- Email sending on order placement

#### **16.3 User Acceptance Testing**

**Test Scenarios**:

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Order Flow | Browse → Add → Cart → Order | Order placed successfully |
| Personalization | Order hot coffee → Return to home | Featured section changes |
| Email | Place order | Confirmation email received |
| Review | Complete order → Write review | Review saved to order |
| Cart | Add/remove items | Totals update correctly |

---

### **17. Analytics & Metrics**

#### **17.1 Key Metrics to Track**

| Metric | Description | Target |
|--------|-------------|--------|
| **Conversion Rate** | Orders / Visitors | > 15% |
| **Average Order Value** | Total revenue / Orders | ₹150+ |
| **Cart Abandonment** | Abandoned carts / Total carts | < 30% |
| **Personalization Accuracy** | Correct preferences / Total | > 80% |
| **Page Load Time** | Average load time | < 2s |
| **Return User Rate** | Repeat visitors | > 40% |

#### **17.2 Event Tracking**

**Events to Track**:
- Page views (Home, Menu, Cart, Track Order, About)
- Add to cart
- Remove from cart
- Order placed
- Order status changes
- Review submitted
- Featured section displayed (which variant)
- Email sent successfully/failed

---

### **18. Security Considerations**

#### **18.1 Data Security**

- **API Keys**: Stored in environment variables (`.env`)
- **HTTPS**: All API calls over HTTPS
- **Input Validation**: Sanitize user inputs
- **XSS Protection**: Use `sanitizeHtml` for rich text rendering

#### **18.2 Privacy**

- **No PII Collection**: No personal information stored
- **localStorage**: Only order data and preferences
- **Anonymous Users**: No login/authentication required
- **Email**: Only order confirmation (user provides address at checkout - future feature)

---

### **19. Deployment**

#### **19.1 Build Process**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output
build/
  ├── static/
  │   ├── js/
  │   │   └── main.908ba90a.js (232.71 KB)
  │   └── css/
  │       └── main.1b0b146b.css (5.85 KB)
  ├── index.html
  └── asset-manifest.json
```

#### **19.2 Environment Variables**

Required `.env` file:

```env
# Contentstack
REACT_APP_CONTENTSTACK_API_KEY=bltb34bfa72850a449c
REACT_APP_CONTENTSTACK_ACCESS_TOKEN=csa6deb56c24d904c40904f739
REACT_APP_CONTENTSTACK_ENVIRONMENT=blt38624c026d2cc447

# Personalize SDK (optional)
REACT_APP_CONTENTSTACK_PERSONALIZE_PROJECT_UID=<project_uid>
REACT_APP_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=<edge_api_url>

# Email Automation
REACT_APP_EMAIL_WEBHOOK_URL=<webhook_url>
```

#### **19.3 Hosting Options**

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** | Free, auto-deploy, CDN | - |
| **Netlify** | Free, easy setup | - |
| **AWS S3 + CloudFront** | Scalable, cheap | Setup complexity |
| **Firebase Hosting** | Fast, integrated | - |

**Recommended**: Vercel or Netlify (easiest for React SPA)

---

### **20. Future Enhancements**

#### **20.1 Phase 2 Features**

| Feature | Priority | Effort |
|---------|----------|--------|
| **User Authentication** | High | Large |
| **Payment Integration** | High | Large |
| **Order History (Full)** | Medium | Medium |
| **Favorites / Wishlist** | Medium | Small |
| **Push Notifications** | Medium | Medium |
| **Loyalty Program** | Low | Large |
| **Social Sharing** | Low | Small |

#### **20.2 Technical Improvements**

- **Progressive Web App (PWA)**: Offline support, installability
- **Server-Side Rendering (SSR)**: Better SEO, faster initial load
- **GraphQL**: More efficient data fetching
- **Advanced Analytics**: Heatmaps, session recordings
- **A/B Testing**: Optimize conversion rates

---

## 📊 Success Criteria

### **Launch Criteria**

✅ All pages load without errors  
✅ Cart functionality works correctly  
✅ Order placement successful  
✅ Email confirmations sent  
✅ Personalization updates featured sections  
✅ Order tracking timeline functions  
✅ Review submission works  
✅ Mobile responsive on all pages  
✅ Contentstack API integration complete  
✅ Build size < 250KB  

---

## 🎯 Conclusion

GRABO is a modern, personalized coffee ordering platform that combines:

- **Speed**: Quick browsing and ordering (< 2 minutes)
- **Personalization**: Smart recommendations based on preferences
- **Content Flexibility**: Headless CMS for easy updates
- **User Experience**: Clean design, smooth interactions
- **Sustainability**: Promoting eco-friendly practices

**Key Innovations**:
1. **First-order personalization** - Menu adapts after single order
2. **Real-time tracking** - Auto-progressing status timeline
3. **Headless CMS** - Content updates without deployments
4. **Type-based categorization** - Hot/Cold/Mocha grouping

**Target Metrics**:
- 100+ daily orders
- 15%+ conversion rate
- 40%+ repeat users
- 80%+ personalization accuracy
- < 2s page load time

---

## 📚 Related Documentation

- `TYPE_FIELD_FIX.md` - Personalization implementation details
- `README.md` - Setup and installation guide
- `package.json` - Dependencies and scripts
- `.npmrc` - NPM configuration

---

## 📞 Support & Contact

For technical questions or support:
- **Email**: support@grabo.coffee
- **Documentation**: See `/docs` folder
- **Issue Tracking**: GitHub Issues

---

**Document End**

*Last Updated: October 13, 2025*  
*Version: 1.0*  
*Status: Active Development*

