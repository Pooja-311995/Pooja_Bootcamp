import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useOrder } from '../contexts/OrderContext';
import { useNotification } from '../contexts/NotificationContext';
import { usePersonalize } from '../contexts/PersonalizeContext';
import HeroSection from '../components/HeroSection';
import { useMenuNavigation } from '../utils/useMenuNavigation';
import { useCartPage } from '../utils/useCartPage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { getTypeLabel } from '../utils/coffeeTypeMapper';

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const { placeOrder, state: orderState } = useOrder();
  const { addNotification } = useNotification();
  const { setAudienceFromOrder, isInitialized: personalizeInitialized } = usePersonalize();
  const navigate = useNavigate();
  const { handleMenuNavigation } = useMenuNavigation();
  const { cartPageData, emptyCartStory, orderSummaryData, loading, error } = useCartPage();
  
  // Removed order form state - direct navigation to track order
  
  // Effect to trigger home page refresh when user places first order
  useEffect(() => {
    if (orderState.isFirstOrder === false && orderState.userPreference) {
      console.log('🎯 First order completed! User preference set to:', orderState.userPreference);
      console.log('🔄 Home page will be personalized on next visit');
      
      // Store a flag to refresh home page on next visit
      localStorage.setItem('grabo_refresh_home', 'true');
      localStorage.setItem('grabo_user_preference', orderState.userPreference);
    }
  }, [orderState.isFirstOrder, orderState.userPreference]);

  const handleQuantityChange = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleClearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Generate a temporary order ID for the email (will be replaced by actual order ID)
    const tempOrderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Log cart items with their types for debugging
    console.log('🛒 Cart items with types:', state.items.map(item => ({
      title: item.title,
      type: item.type,
      price: item.price,
      quantity: item.quantity
    })));

    // Place the order with default customer info
    const orderData = {
      items: state.items,
      total: state.total,
      customerName: 'Customer',
      customerPhone: '+91 98765 43210',
      deliveryAddress: 'Default Address'
    };

    placeOrder(orderData);

    // Set user audience based on order for Contentstack Personalize
    if (personalizeInitialized) {
      try {
        console.log('🎯 Setting Personalize audience based on order...');
        console.log('📦 Cart items being analyzed:');
        state.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} - Type: "${item.type}"`);
        });
        await setAudienceFromOrder(state.items);
        console.log('✅ User audience updated successfully');
      } catch (error) {
        console.error('❌ Error setting Personalize audience:', error);
        // Don't block order flow if personalization fails
      }
    } else {
      console.log('⚠️ Personalize SDK not initialized yet - skipping audience assignment');
    }

    // Send order confirmation email via Contentstack automation
    try {
      console.log('📧 Attempting to send order confirmation email...');
      
      const emailSent = await sendOrderConfirmationEmail({
        orderId: tempOrderId,
        items: state.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price, // Already a number
          image: item.image,
          quantity: item.quantity,
          type: item.type
        })),
        total: state.total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        customerEmail: 'pooja.mandwale@contentstack.com' // Default email
      });

      if (emailSent) {
        console.log('✅ Order confirmation email sent successfully!');
        addNotification({
          type: 'success',
          title: 'Order Confirmed!',
          message: `Confirmation email sent to pooja.mandwale@contentstack.com`
        });
      } else {
        console.warn('⚠️ Order placed but email failed to send');
        addNotification({
          type: 'info',
          title: 'Order Placed',
          message: 'Order placed successfully! (Email notification pending)'
        });
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
      addNotification({
        type: 'info',
        title: 'Order Placed',
        message: 'Order placed successfully! (Email notification pending)'
      });
    }

    // Clear cart
    dispatch({ type: 'CLEAR_CART' });
    
    // Navigate directly to track order page
    navigate('/track-order');
  };

  // Debug logging
  console.log('🛒 Cart Page Data:', {
    cartPageData,
    heroBanner: cartPageData?.hero_banner,
    bannerImage: cartPageData?.hero_banner?.banner_image,
  });

  console.log("coffee items", state.items);

  if (loading) {
    return (
      <main className="page page__cart">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Loading cart page...</p>
        </div>
      </main>
    );
  }

  if (error || !cartPageData) {
    return (
      <main className="page page__cart">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <ErrorMessage message={error || "Failed to load cart page content from Contentstack API"} />
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Please ensure your Contentstack API is configured correctly.
          </p>
        </div>
      </main>
    );
  }

  // Use dynamic content from Contentstack API (no fallbacks)
  const heroTitle = cartPageData.hero_banner?.banner_title || cartPageData.title || "";
  const heroDescription = cartPageData.hero_banner?.banner_description || cartPageData.page_description || "";
  
  // Handle different image URL formats from Contentstack
  let heroImage = "";
  
  if (cartPageData.hero_banner?.banner_image) {
    const bannerImg = cartPageData.hero_banner.banner_image;
    // Check if it's an object with url property or directly a URL string
    if (typeof bannerImg === 'object' && bannerImg.url) {
      heroImage = bannerImg.url;
    } else if (typeof bannerImg === 'string') {
      heroImage = bannerImg;
    }
  }

  return (
    <main className="page page__cart">
      <HeroSection
        title={heroTitle}
        description={heroDescription}
        backgroundImage={heroImage}
        backgroundFit="cover"
        backgroundPosition="center center"
      />

      <section className="page__cart cart-page">
        <div className="cart-page__container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1rem'
        }}>
          {state.items.length === 0 ? (
            <div className="cart-empty" style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '16px',
              margin: '2rem 0'
            }}>
              <div className="cart-empty__icon" style={{
                fontSize: '4rem',
                color: '#8B4513',
                marginBottom: '1.5rem'
              }}>
                🛒
              </div>
              <h2 className="cart-empty__title" style={{
                fontSize: '2rem',
                color: '#8B4513',
                marginBottom: '1rem',
                fontWeight: 'bold'
              }}>
                {emptyCartStory?.title || "Your Cart is Empty"}
              </h2>
              {emptyCartStory?.content ? (
                <div 
                  className="cart-empty__description" 
                  style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '2rem',
                    maxWidth: '500px',
                    margin: '0 auto 2rem auto',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: emptyCartStory.content }}
                />
              ) : (
                <p className="cart-empty__description" style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  marginBottom: '2rem',
                  maxWidth: '500px',
                  margin: '0 auto 2rem auto',
                  lineHeight: '1.6'
                }}>
                  Discover our premium coffee selection and add your favorites to get started.
                </p>
              )}
              <button 
                className="button button-coffee"
                onClick={handleMenuNavigation}
                style={{
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  borderRadius: '8px'
                }}
              >
                {emptyCartStory?.cta_button?.title || "Explore Our Menu"}
              </button>
            </div>
          ) : (
            <div className="cart-content" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: '2rem',
              alignItems: 'start'
            }}>
              {/* Cart Items */}
              <div className="cart-items" style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <div className="cart-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <h2 className="cart-title" style={{
                    fontSize: '1.8rem',
                    color: '#8B4513',
                    margin: 0,
                    fontWeight: 'bold'
                  }}>
                    Your Coffee Order ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
                  </h2>
                  <button 
                    onClick={handleClearCart}
                    className="button button-outline"
                    style={{
                      fontSize: '0.9rem',
                      padding: '0.5rem 1rem',
                      color: '#dc3545',
                      borderColor: '#dc3545'
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {state.items.map((item) => (
                    <div key={item.id} className="cart-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.5rem',
                      backgroundColor: '#fafafa',
                      borderRadius: '12px',
                      border: '1px solid #eee',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className="cart-item__image" style={{
                        width: '80px',
                        height: '80px',
                        marginRight: '1.5rem',
                        flexShrink: 0
                      }}>
                        <img 
                          src={item.image} 
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/images/common/placeholder.jpg';
                          }}
                        />
                      </div>
                      
                      <div className="cart-item__content" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h3 className="cart-item__title" style={{
                            fontSize: '1.2rem',
                            color: '#333',
                            margin: '0',
                            fontWeight: 'bold'
                          }}>
                            {item.title}
                          </h3>
                          {item.type && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor:  item.type=== 'hot' ? '#fff3e0' : 
                                             item.type === 'cold' ? '#e3f2fd' : 
                                             item.type === 'mocha' ? '#fce4ec' : '#f5f5f5',
                              color: item.type === 'hot' ? '#e65100' : 
                                     item.type === 'cold' ? '#01579b' : 
                                     item.type === 'mocha' ? '#880e4f' : '#666',
                              border: `1px solid ${item.type === 'hot' ? '#ffb74d' : 
                                                   item.type === 'cold' ? '#64b5f6' : 
                                                   item.type === 'mocha' ? '#f48fb1' : '#ddd'}`
                            }}>
                              {getTypeLabel(item.type as any)}
                            </span>
                          )}
                        </div>
                        <p className="cart-item__description" style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.4'
                        }}>
                          {item.description}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="cart-item__quantity" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: item.quantity <= 1 ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#8B4513'
                              }}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span style={{
                              minWidth: '30px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              color: '#333'
                            }}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#8B4513'
                              }}
                            >
                              +
                            </button>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              color: '#8B4513'
                            }}>
                              ₹{item.price * item.quantity}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#666'
                            }}>
                              ₹{item.price} each
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="cart-summary" style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: '2rem'
              }}>
                <h3 className="cart-summary__title" style={{
                  fontSize: '1.5rem',
                  color: '#8B4513',
                  margin: '0 0 1.5rem 0',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {orderSummaryData?.title || "Order Summary"}
                </h3>
                
                <div className="cart-summary__content" style={{ marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ color: '#666' }}>{orderSummaryData?.subtotal_label || "Subtotal"}</span>
                    <span style={{ fontWeight: 'bold' }}>₹{state.total.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ color: '#666' }}>{orderSummaryData?.delivery_fee_label || "Delivery Fee"}</span>
                    <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>FREE</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '2px solid #8B4513',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8B4513' }}>{orderSummaryData?.total_label || "Total"}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8B4513' }}>
                      ₹{state.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="cart-summary__actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    className="button button-outline"
                    onClick={handleMenuNavigation}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1rem',
                      borderRadius: '8px'
                    }}
                  >
                    {orderSummaryData?.button?.button_label || "Add More Items"}
                  </button>
                  <button 
                    className="button button-coffee"
                    onClick={handlePlaceOrder}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      backgroundColor: '#8B4513',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#6B3410';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#8B4513';
                    }}
                  >
                    {orderSummaryData?.button_2?.button_label || "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Form Modal removed - direct navigation to track order */}
    </main>
  );
};

export default Cart;
