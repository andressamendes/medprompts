import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SkipLinks } from './components/SkipLinks';
import Index from './pages/Index';

function App() {
  return (
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
  );
}

export default App;
