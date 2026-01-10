import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ FORÇAR INCLUSÃO: Imports explícitos para prevenir tree-shaking incorreto
import '@/components/focumon/FullscreenStudyRoom';
import '@/components/focumon/HospitalInfirmary';
import '@/components/focumon/StardewHospital';
import '@/components/focumon/AvatarCustomizationModal';

/**
 * Ponto de entrada da aplicação
 * Renderiza o componente App no elemento root do HTML
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
