import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { store } from '@/store'
import { AuthProvider } from '@/context/AuthContext'
import MouseGlow from '@/components/mouse-glow'
import './index.css'
import { themeConfig } from '@/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ConfigProvider theme={themeConfig}>
          <BrowserRouter>
            <MouseGlow />
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
