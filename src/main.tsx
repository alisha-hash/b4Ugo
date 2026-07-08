import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import SearchPage from './SearchPage'
import StyleMePage from './StyleMePage'
import ResultsPage from './ResultsPage'
import ClosetPage from './ClosetPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/style-me" element={<StyleMePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/closet" element={<ClosetPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
