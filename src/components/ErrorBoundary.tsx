import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Captura erros de renderização React e exibe UI de fallback
 * WCAG compliant com ARIA labels
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Loga o erro
    console.error('Error Boundary capturou um erro:', error, errorInfo);

    // Salva erro no localStorage para análise posterior
    this.logErrorToStorage(error, errorInfo);

    // Chama callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Atualiza state com informações completas
    this.setState({
      errorInfo,
    });
  }

  /**
   * Salva erro no localStorage para análise
   */
  private logErrorToStorage(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      const existingLogs = localStorage.getItem('error-logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Mantém apenas os últimos 50 erros
      logs.push(errorLog);
      if (logs.length > 50) {
        logs.shift();
      }

      localStorage.setItem('error-logs', JSON.stringify(logs));
    } catch (storageError) {
      console.error('Falha ao salvar erro no storage:', storageError);
    }
  }

  /**
   * Reset do error boundary
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Recarrega a página
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Volta para home
   */
  private handleGoHome = () => {
    window.location.href = '/medprompts/';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada se fornecida
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <AlertTriangle
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ops! Algo deu errado
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Encontramos um erro inesperado. Não se preocupe, seus dados estão seguros.
              </p>
            </div>

            {/* Error Details (apenas em dev) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Detalhes técnicos (modo desenvolvimento)
                </summary>
                <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 overflow-auto max-h-40">
                  <p className="text-red-600 dark:text-red-400 font-mono text-xs break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-gray-600 dark:text-gray-400 text-xs overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
                aria-label="Tentar novamente"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Tentar Novamente
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  aria-label="Recarregar página"
                >
                  Recarregar
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  aria-label="Voltar para página inicial"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Início
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary em componentes funcionais
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
