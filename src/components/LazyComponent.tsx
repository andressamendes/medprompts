import React, { lazy, Suspense, ComponentType } from 'react';

/**
 * Componente genérico para lazy loading
 * Adiciona Suspense boundary automaticamente
 */

/**
 * Loading skeleton genérico
 */
function DefaultFallback() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  );
}

/**
 * Wrapper para lazy load de componentes
 * 
 * @example
 * const HeavyComponent = createLazyComponent(
 *   () => import('./HeavyComponent'),
 *   <CustomSkeleton />
 * );
 */
export function createLazyComponent(
  factory: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
): ComponentType<any> {
  const LazyComp = lazy(factory);

  return function LazyComponentWrapper(props: any) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

/**
 * Hook para prefetch de componentes lazy
 * Carrega componente em background
 * 
 * @example
 * const prefetchChart = usePrefetch(() => import('./Chart'));
 * // Chama prefetchChart() quando usuário hoverar botão
 */
export function usePrefetch(factory: () => Promise<any>) {
  return () => {
    // Inicia o load do componente
    factory();
  };
}

/**
 * Componente para lazy load sob demanda (intersection observer)
 * Só carrega quando fica visível na tela
 * 
 * @example
 * <LazyOnView factory={() => import('./HeavyChart')} />
 */
interface LazyOnViewProps {
  factory: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  [key: string]: any;
}

export function LazyOnView({
  factory,
  fallback,
  rootMargin = '50px',
  threshold = 0.01,
  ...props
}: LazyOnViewProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const LazyComp = lazy(factory);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={fallback || <DefaultFallback />}>
          <LazyComp {...props} />
        </Suspense>
      ) : (
        fallback || <DefaultFallback />
      )}
    </div>
  );
}
