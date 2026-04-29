import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SPA: Lytics counts full page loads by default; client-side route changes need
 * pageView (and loadEntity for profile/campaign refresh). Safe no-op if jstag missing.
 */
export default function LyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const j = window.jstag;
    if (!j) return;
    try {
      j.pageView();
      j.loadEntity?.();
    } catch {
      /* ignore */
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

declare global {
  interface Window {
    jstag?: {
      pageView: () => void;
      loadEntity?: () => void;
    };
  }
}
