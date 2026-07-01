import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'

// Bootstrap CSS — imported once here, available everywhere
import 'bootstrap/dist/css/bootstrap.min.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 404s — the resource genuinely doesn't exist
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 2
      },
      staleTime: 1000 * 60, // 1 minute default
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {/* DevTools panel — visible only in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  </React.StrictMode>
)
