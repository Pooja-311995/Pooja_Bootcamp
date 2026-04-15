import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../types';
import { useMenuNavigation } from '../utils/useMenuNavigation';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { handleMenuNavigation } = useMenuNavigation();
  const { state: cartState } = useCart();

  const navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Cart', path: '/cart' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'About', path: '/about' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo logo">GRABO</Link>
        <div className="header__navigation">
          <div className="header__menu menu">
            <nav className={`menu__body ${isMenuOpen ? 'menu-open' : ''}`}>
              <ul className="menu__list">
                {navItems.map((item) => (
                  <li key={item.path} className="menu__item">
                    {item.path === '/menu' ? (
                      <button 
                        className={`menu__link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={(e) => {
                          closeMenu();
                          handleMenuNavigation(e);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', fontWeight: 'bold' }}
                      >
                        {item.label}
                      </button>
                    ) : item.path === '/cart' ? (
                      <Link 
                        to={item.path} 
                        className={`menu__link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={closeMenu}
                        style={{ position: 'relative' }}
                      >
                        {item.label}
                        {cartState.items.length > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <Link 
                        to={item.path} 
                        className={`menu__link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={closeMenu}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="header__actions actions-header">
            <button 
              type="button" 
              className={`menu__icon icon-menu ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
