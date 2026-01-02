import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './styles/tutorial.css'
import './styles/accessibility.css'

// Sistema de segurança
import { applyCSPReportOnly, setupCSPReporting, isCSPSupported } from './lib/csp'

// Aplica Content Security Policy
if (isCSPSupported()) {
  // Modo Report-Only em desenvolvimento (apenas loga violações)
  if (process.env.NODE_ENV === 'development') {
    applyCSPReportOnly();
    console.info('🔒 CSP ativo em modo Report-Only (desenvolvimento)');
  } else {
    // Em produção, aplicar CSP completo via meta tag
    // Nota: Idealmente, CSP deve ser configurado via HTTP headers no servidor
    console.info('🔒 CSP deve ser configurado via HTTP headers em produção');
  }
  
  // Setup de reporting de violações
  setupCSPReporting();
} else {
  console.warn('⚠️ Navegador não suporta CSP');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/medprompts">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
