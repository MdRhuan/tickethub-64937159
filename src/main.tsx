import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const screenStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
  color: '#1a3a6b',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '24px',
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '12px 24px',
  backgroundColor: '#1a3a6b',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 600,
};

const MissingConfig = () => (
  <div style={screenStyle} role="alert">
    <h2 style={{ margin: 0, fontSize: '22px' }}>Configuração ausente</h2>
    <p style={{ marginTop: '12px', maxWidth: '520px' }}>
      As variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> precisam
      ser definidas no ambiente de build para que o site funcione corretamente.
    </p>
    <button type="button" style={buttonStyle} onClick={() => window.location.reload()}>
      Recarregar
    </button>
  </div>
);

const LoadFailed = ({ message }: { message: string }) => (
  <div style={screenStyle} role="alert">
    <h2 style={{ margin: 0, fontSize: '22px' }}>Falha ao carregar o aplicativo</h2>
    <p style={{ marginTop: '12px', maxWidth: '520px' }}>{message}</p>
    <button type="button" style={buttonStyle} onClick={() => window.location.reload()}>
      Recarregar
    </button>
  </div>
);

const root = createRoot(document.getElementById('root')!);

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // eslint-disable-next-line no-console
  console.error('[config] VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY ausentes no build.');
  root.render(
    <StrictMode>
      <MissingConfig />
    </StrictMode>,
  );
} else {
  import('./App')
    .then(({ default: App }) => {
      root.render(
        <StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
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
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error('[main] Falha ao carregar App:', err);
      root.render(
        <StrictMode>
          <LoadFailed message={err?.message || 'Erro desconhecido ao carregar o app.'} />
        </StrictMode>,
      );
    });
}
