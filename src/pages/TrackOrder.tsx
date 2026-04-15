import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useMenuNavigation } from '../utils/useMenuNavigation';
import { useOrder } from '../contexts/OrderContext';
import { useTrackOrderPage } from '../utils/useTrackOrderPage';
import StatusTimer from '../components/StatusTimer';
import { getOrderStatusData, OrderStatusData, getReviewSectionData, ReviewSectionData } from '../services/contentstackApi';

const TrackOrder: React.FC = () => {
  const { state: orderState, addReview } = useOrder();
  const { handleMenuNavigation } = useMenuNavigation();
  const { trackOrderPageData, loading, error } = useTrackOrderPage();
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData | null>(null);
  const [reviewSectionData, setReviewSectionData] = useState<ReviewSectionData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });

  // Fetch order status data and review section data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderStatus, reviewSection] = await Promise.all([
          getOrderStatusData(),
          getReviewSectionData()
        ]);
        
        if (orderStatus) {
          setOrderStatusData(orderStatus);
          console.log('✅ Order status data loaded:', orderStatus);
        }
        
        if (reviewSection) {
          setReviewSectionData(reviewSection);
          console.log('✅ Review section data loaded:', reviewSection);
        }
      } catch (err) {
        console.error('❌ Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleReviewSubmit = (orderId: string) => {
    if (reviewForm.rating === 0) {
      alert('Please select a star rating.');
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      alert('Please write a review comment.');
      return;
    }

    addReview(orderId, {
      ...reviewForm,
      reviewDate: new Date().toISOString()
    });

    setShowReviewForm(null);
    setReviewForm({ rating: 0, comment: '' });
  };

  // Status functions removed - using StatusTimer component

  // Show only current order and last order (maximum 2 orders)
  const visibleOrders = orderState.orders.slice(0, 2);
  
  const filteredOrders = visibleOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? '#FFD700' : '#ddd',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <main className="page page__track-order">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Loading track order page...</p>
        </div>
      </main>
    );
  }

  if (error || !trackOrderPageData) {
    return (
      <main className="page page__track-order">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <ErrorMessage message={error || "Failed to load track order page content from Contentstack API"} />
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Please ensure your Contentstack API is configured correctly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page page__track-order">
      <HeroSection
        title={trackOrderPageData.hero_banner?.banner_title || trackOrderPageData.title || ""}
        description={trackOrderPageData.hero_banner?.banner_description || ""}
        backgroundImage={trackOrderPageData.hero_banner?.banner_image?.url || ""}
        isCompact={true}
        backgroundFit="cover"
        backgroundPosition="center center"
      />

      <section className="track-order-section">
        <div className="container">
          <div className="track-order-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
            maxWidth: '1000px',
            margin: '0 auto 2rem auto',
            padding: '0 1rem'
          }}>
            <h2 className="section-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2c3e50',
              margin: 0,
              background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
              Your Orders
            </h2>
            <div className="search-container" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by order ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  padding: '1rem 1rem 1rem 3rem',
                  border: '2px solid #e1e8ed',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  width: '350px',
                  maxWidth: '100%',
                  backgroundColor: '#fafbfc',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8B4513';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e8ed';
                  e.target.style.backgroundColor = '#fafbfc';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8B4513',
                fontSize: '1.1rem'
              }}>
                🔍
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders" style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '12px',
              margin: '2rem 0'
            }}>
              {searchTerm ? (
                <h3 style={{ color: '#666', marginBottom: '1rem' }}>
                  No orders match your search criteria.
                </h3>
              ) : (
                <>
                  <h3 style={{ 
                    color: '#8B4513', 
                    marginBottom: '1rem',
                    fontSize: '1.8rem',
                    fontWeight: 'bold'
                  }}>
                    {trackOrderPageData.story_section?.title || "No Orders Yet"}
                  </h3>
                  {trackOrderPageData.story_section?.content ? (
                    <div 
                      style={{ 
                        color: '#666', 
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        margin: '0 auto 1.5rem auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: trackOrderPageData.story_section.content }}
                    />
                  ) : (
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                      You haven't placed any orders yet. Start by adding some delicious coffee to your cart!
                    </p>
                  )}
                  <button 
                    className="button button-coffee"
                    onClick={handleMenuNavigation}
                  >
                    {trackOrderPageData.story_section?.cta_button?.title || "Browse Menu"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="orders-list" style={{
              maxWidth: '1000px',
              margin: '0 auto',
              padding: '0 1rem'
            }}>
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div className="order-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#8B4513', fontSize: '1.3rem' }}>
                        {orderStatusData?.order_id_label || "Order Id : "}{order.id}
                      </h3>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <StatusTimer status={order.status} statusStartTime={order.statusStartTime} />
                  </div>

                  <div className="order-items" style={{ 
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 1.5rem 0', 
                      color: '#2c3e50',
                      fontSize: '1.3rem',
                      fontWeight: '700'
                    }}>
                      {orderStatusData?.title || "Your Order"}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {order.items.map((item) => (
                        <div key={item.id} className="order-menu-card" style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                          border: '1px solid #f0f0f0',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '180px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <img
                              src={item.image}
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/images/common/placeholder.jpg';
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '0.75rem',
                              right: '0.75rem',
                              backgroundColor: '#8B4513',
                              color: 'white',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <div style={{
                            padding: '1.25rem',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <h5 style={{ 
                              margin: '0 0 0.5rem 0', 
                              color: '#2c3e50',
                              fontSize: '1.1rem',
                              fontWeight: '600'
                            }}>
                              {item.title}
                            </h5>
                            <p style={{ 
                              margin: '0 0 1rem 0', 
                              color: '#666', 
                              fontSize: '0.85rem',
                              lineHeight: '1.4',
                              flex: 1
                            }}>
                              {item.description.substring(0, 80)}...
                            </p>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid #f0f0f0'
                            }}>
                              <span style={{ 
                                color: '#8B4513', 
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                ₹{item.price} each
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                color: '#8B4513',
                                fontSize: '1.1rem'
                              }}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-summary" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    marginTop: '1.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '1.5rem',
                      borderRadius: '10px',
                      flex: 1,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '600', 
                          color: '#2c3e50',
                          letterSpacing: '0.01em'
                        }}>
                          Total Amount
                        </span>
                        <span style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          color: '#8B4513',
                          background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {order.status === 'Order Picked' && !order.review && (
                      <button
                        className="button button-coffee"
                        onClick={() => setShowReviewForm(order.id)}
                        style={{ 
                          fontSize: '0.9rem', 
                          padding: '0.75rem 1.5rem',
                          marginLeft: '1rem'
                        }}
                      >
                        Write Review
                      </button>
                    )}
                  </div>

                  {order.review && (
                    <div className="review-section" style={{
                      backgroundColor: '#f9f9f9',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Your Review:</h4>
                      <div style={{ marginBottom: '0.5rem' }}>
                        {renderStars(order.review.rating)}
                        <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                          ({order.review.rating}/5)
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{order.review.comment}</p>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.8rem' }}>
                        Reviewed on {new Date(order.review.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            position: 'relative'
          }}>
            {/* Header with coffee icon */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>☕</div>
              <h2 style={{ 
                margin: '0',
                color: '#8B4513',
                fontSize: '1.8rem',
                fontWeight: '700',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {reviewSectionData?.title || "Write a Review"}
              </h2>
              <p style={{
                margin: '0.5rem 0 0 0',
                color: '#999',
                fontSize: '0.95rem'
              }}>
                Share your coffee experience with us
              </p>
            </div>
            
            {/* Rating Section */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '1rem',
                fontWeight: '600',
                fontSize: '1.05rem',
                color: '#2c3e50'
              }}>
                {reviewSectionData?.rating_label || "Rating"} *
              </label>
              <div style={{ 
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#fafbfc',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewForm({...reviewForm, rating: i + 1})}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2.5rem',
                      color: i < reviewForm.rating ? '#FFD700' : '#e0e0e0',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'all 0.2s ease',
                      transform: i < reviewForm.rating ? 'scale(1.1)' : 'scale(1)',
                      filter: i < reviewForm.rating ? 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = i < reviewForm.rating ? 'scale(1.1)' : 'scale(1)';
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p style={{
                margin: '0',
                color: '#8B4513',
                fontSize: '1rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                {reviewForm.rating > 0 ? `${reviewForm.rating} out of 5 stars` : 'No rating selected'}
              </p>
            </div>

            {/* Comment Section */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                fontSize: '1.05rem',
                color: '#2c3e50'
              }}>
                {reviewSectionData?.review_comment_label || "Review Comment"} *
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                required
                rows={5}
                placeholder="Share your experience with this order..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e8e8e8',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#8B4513';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                }}
              />
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.85rem',
                color: '#999',
                fontStyle: 'italic'
              }}>
                Tell us what you loved about your coffee!
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(null);
                  setReviewForm({ rating: 0, comment: '' });
                }}
                style={{
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '2px solid #8B4513',
                  backgroundColor: 'transparent',
                  color: '#8B4513',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {reviewSectionData?.cancel_button?.title || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleReviewSubmit(showReviewForm)}
                style={{
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)',
                  minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6d3410';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8B4513';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.3)';
                }}
              >
                {reviewSectionData?.submit_button?.title || "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TrackOrder;