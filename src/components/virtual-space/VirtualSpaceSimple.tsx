import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const VirtualSpaceSimple: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Force iframe reload
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleIframeLoad = () => {
    console.log('✅ Game iframe loaded');
    setIsLoading(false);
  };

  const handleIframeError = () => {
    console.error('❌ Game iframe failed to load');
    setError('Failed to load game. Please check your internet connection and try again.');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 rounded-lg p-8 border border-red-600">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Game Error</h2>
          <p className="text-white mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
            >
              Go Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950">
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/80 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span>Back to Hub</span>
      </button>

      <div className="fixed top-4 right-4 z-50 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Virtual Space (Simple Version)</p>
        <p>Player: <span className="text-green-400">Guest</span></p>
        <p>Level: <span className="text-yellow-400">1</span></p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading Virtual Space...</p>
            <p className="text-slate-400 text-sm mt-2">Initializing game...</p>
          </div>
        </div>
      )}

      <iframe
        id="game-iframe"
        src="/test-virtual-space.html"
        className="w-full h-full border-0"
        title="Virtual Space Game"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin"
      />

      <div className="fixed bottom-4 right-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys - Move</p>
      </div>
    </div>
  );
};