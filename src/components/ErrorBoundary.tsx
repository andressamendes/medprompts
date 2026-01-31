import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary com integração ao sistema de logging
 * Captura erros não tratados e os registra automaticamente
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.fatal('Erro não tratado capturado pelo Error Boundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
      timestamp: new Date().toISOString(),
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="p-8 text-center max-w-xl mx-auto"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ⚠️ Algo deu errado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          {this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs text-gray-800 dark:text-gray-200">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
