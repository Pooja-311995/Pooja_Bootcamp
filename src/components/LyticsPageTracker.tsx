import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fire Lytics virtual page views on SPA navigations (must live inside Router).
 */
export default function LyticsPageTracker() {
  const location = useLocation();

  useEffect(() => {
    window.jstag?.pageView();
    window.jstag?.loadEntity?.();
  }, [location.pathname, location.search, location.hash]);

  return null;
}
