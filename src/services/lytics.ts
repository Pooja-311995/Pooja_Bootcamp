/**
 * Lytics jstag — enabled when:
 * - NODE_ENV is production (normal `npm run build`), or
 * - REACT_APP_LYTICS_ENABLE_IN_DEV=true (local npm start), or
 * - REACT_APP_LYTICS_ENABLE=true (use on CI / hosts that build with NODE_ENV=development)
 *
 * Set REACT_APP_LYTICS_ENABLE=false to force off even in production.
 * Tag URL: REACT_APP_LYTICS_TAG_SRC.
 *
 * After load, check `window.__GRABO_LYTICS__` in the console if `jstag` is missing.
 * In DevTools, use `window.jstag` (not bare `jstag`) so the global is always found.
 */

function lyticsHeadSnippetActive(): boolean {
  return window.__GRABO_LYTICS__ === 'head_snippet';
}

function lyticsRuntimeEnabled(): boolean {
  if (process.env.REACT_APP_LYTICS_ENABLE === 'false') return false;
  if (process.env.REACT_APP_LYTICS_ENABLE === 'true') return true;
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.REACT_APP_LYTICS_ENABLE_IN_DEV === 'true';
}

function setLyticsDiag(status: string): void {
  (window as Window & { __GRABO_LYTICS__?: string }).__GRABO_LYTICS__ = status;
}

const DEFAULT_TAG_SRC =
  '//c.lytics.io/api/tag/a011be583d24cc50ef62847cad09eaaa/latest.min.js';

type JstagConfig = { src: string };

type JstagApi = {
  config?: JstagConfig;
  init: (config: JstagConfig) => unknown;
  loadScript?: (
    src: string,
    onload?: () => void,
    onerror?: (err?: unknown) => void
  ) => unknown;
  pageView: (...args: unknown[]) => void;
  loadEntity?: (cb?: (profile: unknown) => void) => void;
  [key: string]: unknown;
};

let initStarted = false;

function tagSrc(): string {
  return process.env.REACT_APP_LYTICS_TAG_SRC || DEFAULT_TAG_SRC;
}

/**
 * Minimal jstag stub matching Lytics’ inline loader: queues calls until the remote tag loads.
 */
function installJstagStub(): void {
  if (window.jstag) return;

  const queue: [string, unknown[]][] = [];
  const jstag = {} as JstagApi;

  function stubMethod(name: string): void {
    (jstag as Record<string, unknown>)[name] = (...args: unknown[]) => {
      queue.push([name, args]);
    };
  }

  for (const name of [
    'send',
    'mock',
    'identify',
    'pageView',
    'unblock',
    'getid',
    'setid',
    'loadEntity',
    'getEntity',
    'on',
    'once',
    'call',
  ]) {
    stubMethod(name);
  }

  jstag.loadScript = function loadScript(
    src: string,
    onload?: () => void,
    onerror?: (err?: unknown) => void
  ) {
    const el = document.createElement('script');
    el.async = true;
    el.src = src;
    if (onload) el.onload = () => onload();
    if (onerror) el.onerror = () => onerror();
    const first = document.getElementsByTagName('script')[0];
    const parent =
      (first && first.parentNode) || document.head || document.body;
    const ref = first || parent.lastChild;
    if (ref != null) parent.insertBefore(el, ref);
    else parent.appendChild(el);
    return jstag;
  };

  const stubInit = function init(config: JstagConfig): unknown {
    jstag.config = config;
    jstag.loadScript!(config.src, function onScriptLoaded() {
      const live = window.jstag as JstagApi | undefined;
      if (!live || live.init === stubInit) {
        throw new Error('Lytics load error: tag script did not replace jstag.init');
      }
      live.init(config);
      for (const [method, args] of queue) {
        const fn = live[method] as ((...a: unknown[]) => void) | undefined;
        fn?.apply(live, args);
      }
    });
    return jstag;
  };

  jstag.init = stubInit;
  window.jstag = jstag;
}

/** Call once at app bootstrap (before React render). */
export function initLytics(): void {
  setLyticsDiag('init_invoked');
  if (typeof window !== 'undefined' && window.jstag) {
    initStarted = true;
    setLyticsDiag('head_snippet');
    return;
  }
  if (!lyticsRuntimeEnabled()) {
    setLyticsDiag('runtime_disabled');
    return;
  }
  if (initStarted) {
    setLyticsDiag('already_started');
    return;
  }
  initStarted = true;

  try {
    installJstagStub();
    window.jstag?.init({ src: tagSrc() });
    setLyticsDiag('stub_installed');
  } catch (e) {
    setLyticsDiag('init_error');
    console.error('[Lytics] init failed', e);
  }
}

/**
 * SPA route change: page view + profile reload (Lytics docs recommend both on every route change).
 * Safe no-op when disabled or before jstag exists.
 */
export function trackLyticsPageView(): void {
  if (!lyticsRuntimeEnabled() && !lyticsHeadSnippetActive()) return;
  try {
    window.jstag?.pageView();
    window.jstag?.loadEntity?.();
  } catch (e) {
    console.error('[Lytics] route tracking failed', e);
  }
}

declare global {
  interface Window {
    jstag?: JstagApi;
    /** Set by initLytics: init_invoked | runtime_disabled | stub_installed | init_error | … */
    __GRABO_LYTICS__?: string;
  }
}
