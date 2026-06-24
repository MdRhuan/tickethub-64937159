import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const wrapStyle: React.CSSProperties = {
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

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={wrapStyle} role="alert">
          <h2 style={{ margin: 0, fontSize: '22px' }}>Algo deu errado</h2>
          <p style={{ marginTop: '12px', maxWidth: '480px' }}>
            {this.state.error?.message || 'Ocorreu um erro inesperado.'}
          </p>
          <button type="button" style={buttonStyle} onClick={this.handleReload}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
