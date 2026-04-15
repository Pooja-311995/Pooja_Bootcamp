import { useLocation, useNavigate } from 'react-router-dom';

export const useMenuNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuNavigation = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (location.pathname === '/menu') {
      // If already on menu page, scroll to menu items
      const menuItems = document.getElementById('menu-items');
      if (menuItems) {
        menuItems.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // Navigate to menu page and then scroll to menu items
      navigate('/menu');
      // Use setTimeout to ensure the page has loaded before scrolling
      setTimeout(() => {
        const menuItems = document.getElementById('menu-items');
        if (menuItems) {
          menuItems.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };

  const handleMenuNavigationWithAnchor = (anchor: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (location.pathname === '/menu') {
      // If already on menu page, scroll to specific item
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    } else {
      // Navigate to menu page with anchor and then scroll to specific item
      navigate(`/menu#${anchor}`);
      // Use setTimeout to ensure the page has loaded before scrolling
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  };

  return {
    handleMenuNavigation,
    handleMenuNavigationWithAnchor
  };
};
