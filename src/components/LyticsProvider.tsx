import { useEffect, type ReactNode } from 'react';

interface LyticsProviderProps {
  children: ReactNode;
}

/**
 * Loads the Lytics tag from the bundle (works when hosting strips custom index.html scripts).
 * Override URL with REACT_APP_LYTICS_SCRIPT_URL, or set REACT_APP_LYTICS_ACCOUNT_ID (+ optional staging).
 */
function getLyticsScriptSrc(): string {
  const fromEnv = process.env.REACT_APP_LYTICS_SCRIPT_URL?.trim();
  if (fromEnv) {
    return fromEnv.startsWith('//') ? `https:${fromEnv}` : fromEnv;
  }
  const accountId =
    process.env.REACT_APP_LYTICS_ACCOUNT_ID?.trim() ||
    'a011be583d24cc50ef62847cad09eaaa';
  const staging = process.env.REACT_APP_LYTICS_USE_STAGING === 'true';
  const host = staging ? 'https://staging.lytics.io' : 'https://c.lytics.io';
  return `${host}/api/tag/${accountId}/latest.min.js`;
}

export default function LyticsProvider({ children }: LyticsProviderProps) {
  useEffect(() => {
    if (document.getElementById('lytics-tag')) return;

    const script = document.createElement('script');
    script.id = 'lytics-tag';
    script.type = 'text/javascript';
    script.src = getLyticsScriptSrc();
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
