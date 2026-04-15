/**
 * Lytics jstag — production only.
 * Tag URL can be overridden with REACT_APP_LYTICS_TAG_SRC.
 */

const DEFAULT_TAG_SRC =
  'https://c.lytics.io/api/tag/a011be583d24cc50ef62847cad09eaaa/latest.min.js';

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
  if (process.env.NODE_ENV !== 'production') return;
  if (initStarted) return;
  initStarted = true;

  try {
    installJstagStub();
    window.jstag?.init({ src: tagSrc() });
  } catch (e) {
    console.error('[Lytics] init failed', e);
  }
}

/** Fire on each route (including initial load). Safe no-op outside production or before jstag exists. */
export function trackLyticsPageView(): void {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    window.jstag?.pageView();
  } catch (e) {
    console.error('[Lytics] pageView failed', e);
  }
}

declare global {
  interface Window {
    jstag?: JstagApi;
  }
}
