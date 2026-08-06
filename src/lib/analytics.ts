/**
 * Inicialização condicional do Google Analytics (gtag.js nativo).
 *
 * O gtag só é carregado quando TODAS as condições valem:
 *  - VITE_GA_ID existe e não está vazio
 *  - window.location.hostname é exatamente PROD_HOSTNAME
 *  - roda em browser (typeof window !== 'undefined')
 *  - navegador não é headless/prerender (navigator.webdriver falsy)
 *
 * Em localhost, previews (*.lovable.app, *.lovableproject.com) ou qualquer
 * outro hostname, o gtag não é carregado nem dispara eventos.
 */

const PROD_HOSTNAME = 'www.tickethubh.com.br'; // TODO: ajustar conforme decisão sobre domínio com/sem www

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Measurement ID definido via ambiente (VITE_GA_ID), sem espaços. */
export function getMeasurementId(): string {
  return (import.meta.env.VITE_GA_ID ?? '').trim();
}

/** ID usado por quem dispara eventos manuais (ex.: page_view por rota). */
export const GA_MEASUREMENT_ID = getMeasurementId();

/** True apenas quando o gtag pode carregar e disparar eventos. */
export function shouldLoadAnalytics(): boolean {
  if (typeof window === 'undefined') return false;
  if (!getMeasurementId()) return false;
  if (window.location.hostname !== PROD_HOSTNAME) return false;
  if (window.navigator.webdriver) return false;
  return true;
}

/** Carrega o gtag.js (adiado via requestIdleCallback) e configura o Measurement ID. */
export function initAnalytics(): void {
  if (!shouldLoadAnalytics()) return;

  const measurementId = getMeasurementId();

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  let loaded = false;
  function loadGtag() {
    if (loaded) return;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }
  function schedule() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadGtag, { timeout: 3000 });
    }
    setTimeout(loadGtag, 3000);
  }
  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}
