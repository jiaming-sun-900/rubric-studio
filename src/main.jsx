import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { DemoProvider } from './demo/DemoProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* One knob for the whole app: set `base` in vite.config.js and both the
        router and the hard navigation in Layout follow it. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DemoProvider>
        <App />
      </DemoProvider>
    </BrowserRouter>
  </StrictMode>,
)
