import React from 'react';
import { MenuItem } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

interface MenuCardProps {
  item: MenuItem;
  onOrderClick?: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onOrderClick }) => {
  const { dispatch } = useCart();
  const { addNotification } = useNotification();

  const handleAddToCart = () => {
    // Extract numeric price from string (e.g., "₹150" -> 150)
    const price = parseFloat(item.price.replace(/[₹,]/g, '')) || 0;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.id,
        title: item.title,
        description: item.description,
        price: price,
        image: item.image,
        type: item.type
      }
    });

    // Show notification instead of alert
    addNotification({
      type: 'success',
      title: 'Added to Cart!',
      message: `${item.title} has been added to your cart.`,
      itemName: item.title,
      itemImage: item.image,
      showCartButton: true
    });

    if (onOrderClick) {
      onOrderClick(item);
    }
  };

  // Create a URL-friendly ID from the title
  const itemId = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  // console.log("Type of Coffee", item.type);
  console.log("My Item", item);  
  return (
    <div id={itemId} className="menu-page__item menu-item">
      <div className="menu-item__image">
        <img 
          src={item.image} 
          alt={item.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/common/placeholder.jpg';
          }}
        />
      </div>
      <div className="menu-item__content">
        <h3 className="menu-item__title">{item.title}</h3>
        <div className="menu-item__description">
          {item.description}
        </div>
        <div className="menu-item__price">{item.price}</div>
        <button 
          className="menu-item__button button button-coffee" 
          onClick={handleAddToCart}
        >
          Add to Cart
         
        </button>
      </div>

    </div>
  );
};

export default MenuCard;
