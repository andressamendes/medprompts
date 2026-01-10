import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ FORÇAR INCLUSÃO: Import barrel para prevenir tree-shaking incorreto
// Import * força inclusão de TODOS os exports do módulo
import * as focumon from '@/components/focumon';
// Previne que a importação seja removida como "unused"
if (typeof window !== 'undefined') {
  (window as any).__focumon = focumon;
}

/**
 * Ponto de entrada da aplicação
 * Renderiza o componente App no elemento root do HTML
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
