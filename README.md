# GRABO Coffee Shop - React Application

A modern React TypeScript application for GRABO Coffee Shop with Contentstack CMS integration.

## 🚀 Features

- **React 18** with TypeScript
- **React Router** for client-side routing
- **Contentstack Integration** for dynamic content management
- **Responsive Design** with mobile-first approach
- **Modern Component Architecture** with reusable components
- **Custom Hooks** for state management
- **Coffee-themed Design** with beautiful UI

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── HeroSection.tsx # Reusable hero section
│   ├── MenuCard.tsx    # Coffee menu item card
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── pages/              # Page components
│   ├── Home.tsx        # Homepage
│   ├── About.tsx       # About page
│   ├── Services.tsx    # Services page
│   ├── Menu.tsx        # Menu page with API integration
│   └── Contact.tsx     # Contact page
├── services/           # API services
│   ├── apiConfig.ts    # Contentstack configuration
│   └── apiService.ts   # API service methods
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions and custom hooks
│   └── useMenu.ts      # Custom hook for menu data
├── assets/             # Static assets
│   ├── styles/         # CSS files
│   └── images/         # Images (copied to public/assets/)
└── App.tsx             # Main app component with routing
```

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm test`
Launches the test runner in the interactive watch mode.

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🌐 API Integration

The application integrates with Contentstack CMS for dynamic content:

- **Content Type**: `card` (Coffee menu items)
- **API Key**: Configured in `src/services/apiConfig.ts`
- **Environment**: Development
- **Features**: 
  - Real-time menu loading
  - Fallback content when API is unavailable
  - Loading states and error handling

## 📱 Pages

- **Home (`/`)** - Homepage with hero section, about, services, and testimonials
- **About (`/about`)** - About page
- **Services (`/services`)** - Services page with detailed service descriptions
- **Menu (`/menu`)** - Dynamic coffee menu from Contentstack
- **Contact (`/contact`)** - Contact information page

## 🎨 Styling

- Uses existing CSS with React-compatible structure
- Coffee-themed color scheme with gradient logos
- Responsive design for all screen sizes
- Smooth animations and hover effects

## 🔄 Data Flow

1. **Menu Page**: Uses `useMenu` hook to fetch data from Contentstack
2. **API Service**: Handles all Contentstack API calls
3. **Type Safety**: Full TypeScript support with proper type definitions
4. **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🚀 Deployment

The app can be deployed to any static hosting service:

1. Run `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure routing for single-page application

## 🧪 Testing

- Test pages: Visit `/menu` to see live Contentstack integration
- Check browser console for API call logs
- Verify responsive design on different screen sizes

## 📝 Migration Notes

This React application maintains all functionality from the original HTML version:
- ✅ Same visual design and layout
- ✅ Contentstack API integration
- ✅ Responsive behavior
- ✅ Navigation and routing
- ✅ Coffee menu functionality
- ✅ Loading states and error handling

The React version adds:
- ⭐ Component reusability
- ⭐ Type safety with TypeScript
- ⭐ Modern development experience
- ⭐ Better state management
- ⭐ Improved performance