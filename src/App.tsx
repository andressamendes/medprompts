import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SkipLinks } from './components/SkipLinks';
import { ErrorBoundary } from './components/ErrorBoundary';
import Index from './pages/Index';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <SkipLinks />
          <div id="app-container">
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </div>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
