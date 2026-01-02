import { Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'
import Index from './pages/Index'
import GuiaIAs from './pages/GuiaIAs'
import Ferramentas from './pages/Ferramentas'

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/guia-ias" element={<GuiaIAs />} />
          <Route path="/ferramentas" element={<Ferramentas />} />
        </Routes>
        <Toaster />
      </FavoritesProvider>
    </ThemeProvider>
  )
}

export default App
