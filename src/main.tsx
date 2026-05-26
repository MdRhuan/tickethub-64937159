import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev-only horizontal scroll diagnostic (320–768px)
if (import.meta.env.DEV) {
  const check = () => {
    const pageWidth = document.documentElement.scrollWidth;
    const viewportWidth = window.innerWidth;
    if (viewportWidth >= 320 && viewportWidth <= 768 && pageWidth > viewportWidth) {
      // eslint-disable-next-line no-console
      console.warn('[SCROLL HORIZONTAL DETECTADO]', 'scrollWidth:', pageWidth, 'viewportWidth:', viewportWidth);
      document.querySelectorAll<HTMLElement>('*').forEach(el => {
        if (el.offsetWidth > viewportWidth) {
          // eslint-disable-next-line no-console
          console.warn('[ELEMENTO CAUSADOR]', el);
        }
      });
    }
  };
  window.addEventListener('load', () => setTimeout(check, 500));
  window.addEventListener('resize', () => setTimeout(check, 200));
}
