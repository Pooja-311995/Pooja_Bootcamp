import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackLyticsPageView } from '../services/lytics';

/**
 * Sends a Lytics page view on every client-side navigation (and on first load).
 */
export default function LyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackLyticsPageView();
  }, [location.pathname, location.search, location.hash]);

  return null;
}
