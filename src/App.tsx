import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import TrackOrder from './pages/TrackOrder';
import NotificationContainer from './components/NotificationContainer';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PersonalizeProvider } from './contexts/PersonalizeContext';
import { initializeLivePreview } from './utils/livePreview';
import LyticsRouteTracker from './components/LyticsRouteTracker';
// Import email service to make test functions globally available
import './services/emailService';

// Import CSS
import './assets/styles/reset.css';
import './assets/styles/style.css';

function App() {
  // Initialize Contentstack Live Preview (once on app mount)
  useEffect(() => {
    initializeLivePreview();
  }, []);

  useEffect(() => {
    // Add menu toggle functionality
    const handleMenuToggle = () => {
      document.body.classList.toggle('menu-open');
    };

    // Add event listener for menu icon clicks
    const menuIcon = document.querySelector('.icon-menu');
    if (menuIcon) {
      menuIcon.addEventListener('click', handleMenuToggle);
    }

    // Cleanup
    return () => {
      if (menuIcon) {
        menuIcon.removeEventListener('click', handleMenuToggle);
      }
    };
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <PersonalizeProvider>
          <NotificationProvider>
            <Router>
              <LyticsRouteTracker />
              <div className="wrapper">
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                </Routes>
                <Footer />
                <NotificationContainer />
              </div>
            </Router>
          </NotificationProvider>
        </PersonalizeProvider>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;