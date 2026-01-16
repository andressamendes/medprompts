import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const VirtualSpaceEmergency: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple timeout to simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handlePlayGame = () => {
    // Open a simple game in new tab
    window.open('/test-virtual-space.html', '_blank');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Virtual Space (Emergency Mode)...</p>
          <p className="text-slate-400 text-sm mt-2">Using simplified version</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-900 rounded-xl p-8 border border-blue-600">
        <h1 className="text-3xl font-bold text-white mb-2">Virtual Space (Emergency Mode)</h1>
        <p className="text-slate-300 mb-6">
          The main game engine is experiencing issues. You can either play a simplified version
          or return to the hub.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-3">🎮 Play Simplified Game</h2>
            <p className="text-slate-300 mb-4">
              Open a basic version of the game in a new tab. This version has:
            </p>
            <ul className="text-slate-400 space-y-2 mb-6">
              <li>• Basic movement controls</li>
              <li>• Simple graphics</li>
              <li>• No external dependencies</li>
              <li>• Works in all browsers</li>
            </ul>
            <button
              onClick={handlePlayGame}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Game in New Tab
            </button>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-3">🏠 Return to Hub</h2>
            <p className="text-slate-300 mb-4">
              Go back to the main MedPrompts hub and try other features:
            </p>
            <ul className="text-slate-400 space-y-2 mb-6">
              <li>• AI Prompts for medical cases</li>
              <li>• Study schedule planner</li>
              <li>• Medical tools and calculators</li>
              <li>• Profile and progress tracking</li>
            </ul>
            <button
              onClick={handleBack}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Back to MedPrompts Hub
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-2">⚠️ Technical Information</h3>
          <p className="text-slate-400 text-sm">
            The main game engine (Phaser) is having compatibility issues with GitHub Pages.
            This emergency mode ensures you can still access Virtual Space functionality.
            The development team is working on a permanent fix.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>If problems persist, please clear your browser cache and refresh the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors text-sm"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};