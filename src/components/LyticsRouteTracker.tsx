import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackLyticsPageView } from '../services/lytics';

/**
 * On each client-side navigation (and first load): Lytics pageView + loadEntity
 * so page context and personalization profile stay in sync (Lytics SPA guidance).
 */
export default function LyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackLyticsPageView();
  }, [location.pathname, location.search, location.hash]);

  return null;
}
