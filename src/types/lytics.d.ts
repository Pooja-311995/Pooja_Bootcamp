interface LyticsJsTag {
  pageView: () => void;
  loadEntity?: () => void;
  send: (data: Record<string, unknown>) => void;
  identify: (data: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    jstag?: LyticsJsTag;
  }
}

export {};
