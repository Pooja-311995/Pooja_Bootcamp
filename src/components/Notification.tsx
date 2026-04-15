import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification, Notification as NotificationType } from '../contexts/NotificationContext';

const Notification: React.FC<{ notification: NotificationType }> = ({ notification }) => {
  const { removeNotification } = useNotification();
  const navigate = useNavigate();

  const handleViewCart = () => {
    removeNotification(notification.id);
    navigate('/cart');
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#FFFEF7'; // Lightest cream
      case 'error':
        return '#FFFEF7'; // Lightest cream
      case 'info':
        return '#FFFEF7'; // Lightest cream
      default:
        return '#FFFEF7'; // Lightest cream
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return '#E8E0D0'; // Light cream border
      case 'error':
        return '#E8E0D0'; // Light cream border
      case 'info':
        return '#E8E0D0'; // Light cream border
      default:
        return '#E8E0D0'; // Light cream border
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '1rem',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}
    >
      <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {notification.itemImage && (
            <img
              src={notification.itemImage}
              alt={notification.itemName || 'Item'}
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          )}
          <h4 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {notification.title}
          </h4>
        </div>
        
        <p style={{
          margin: '0 0 0.75rem 0',
          fontSize: '0.9rem',
          color: '#666',
          lineHeight: '1.4'
        }}>
          {notification.message}
        </p>
        
        {notification.showCartButton && (
          <button
            onClick={handleViewCart}
            style={{
              backgroundColor: '#8B4513',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6B3410';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#8B4513';
            }}
          >
            View Cart
          </button>
        )}
      </div>
      
      <button
        onClick={() => removeNotification(notification.id)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#666',
          padding: '0',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#333';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#666';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
