import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { ConfigProvider, theme } from 'antd'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 menit — data tidak re-fetch selama ini
      gcTime: 10 * 60 * 1000,    // 10 menit — cache dibersihkan setelah tidak dipakai
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#dc2626', // Mayora Red
            borderRadius: 10,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            colorBgContainer: '#ffffff',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
