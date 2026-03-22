import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import './index.css'
import App from './App.tsx'
import MouseGlow from './components/ui/composed/MouseGlow.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
         <MouseGlow />
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
